import { isNil } from 'lodash-es';

import { MessageStatusEnum } from '@shared/enums/message-status.enum';
import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { nowIso } from '@web/shared/lib/date-time';

import type { ChatMessageInterface, ChatsStateInterface } from '@web/entities/chat/model/chats-slice';
import type { SessionStateInterface } from '@web/entities/session/model/session-slice';
import type { PersistedStateInterface } from '@web/store/hydrate';

export const STORAGE_KEY = 'telegram-chat-state';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !isNil(value) && typeof value === 'object' && !Array.isArray(value);
};

const recoverMessage = (message: ChatMessageInterface): ChatMessageInterface => {
  if (message.status !== MessageStatusEnum.PENDING) {
    return message;
  }

  return {
    ...message,
    status: MessageStatusEnum.FAILED,
    errorDescription: message.errorDescription === '' ? 'Отправка прервана' : message.errorDescription,
  };
};

const isSession = (value: unknown): value is SessionStateInterface => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.idInstance === 'string'
    && typeof value.apiTokenInstance === 'string'
    && typeof value.status === 'string'
    && typeof value.errorMessage === 'string';
};

const isQuote = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.idMessage === 'string'
    && typeof value.authorName === 'string'
    && typeof value.text === 'string'
    && typeof value.outgoing === 'boolean';
};

const isMessage = (value: unknown): value is ChatMessageInterface => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.quote !== undefined && !isQuote(value.quote)) {
    return false;
  }

  return typeof value.clientId === 'string'
    && typeof value.idMessage === 'string'
    && typeof value.text === 'string'
    && typeof value.direction === 'string'
    && typeof value.status === 'string'
    && typeof value.createdAt === 'string'
    && typeof value.errorDescription === 'string';
};

const isChats = (value: unknown): value is ChatsStateInterface => {
  if (!isRecord(value) || !Array.isArray(value.items) || !Array.isArray(value.seenReceiptIds)) {
    return false;
  }

  return typeof value.activePhone === 'string' && typeof value.createPending === 'boolean';
};

export const parseSnapshot = (value: unknown): PersistedStateInterface | null => {
  if (!isRecord(value) || !isSession(value.session) || !isChats(value.chats)) {
    return null;
  }

  const items = value.chats.items.flatMap(item => {
    if (!isRecord(item) || typeof item.phone !== 'string' || !Array.isArray(item.messages)) {
      return [];
    }

    const messages = item.messages.filter(isMessage).map(recoverMessage);

    return [{
      phone: item.phone,
      telegramChatId: typeof item.telegramChatId === 'string' ? item.telegramChatId : '',
      messages,
      unreadCount: typeof item.unreadCount === 'number' ? item.unreadCount : 0,
      firstUnreadClientId: typeof item.firstUnreadClientId === 'string' ? item.firstUnreadClientId : '',
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : nowIso(),
    }];
  });

  const hasCredentials = value.session.idInstance !== '' && value.session.apiTokenInstance !== '';

  return {
    session: {
      ...value.session,
      status: hasCredentials ? SessionStatusEnum.LOADING : SessionStatusEnum.IDLE,
      errorMessage: '',
    },
    chats: {
      items,
      activePhone: value.chats.activePhone,
      createPending: false,
      seenReceiptIds: value.chats.seenReceiptIds.filter(item => typeof item === 'number'),
      earlyStatuses: [],
    },
  };
};

export const readSnapshot = (): Pick<PersistedStateInterface, 'session' | 'chats'> | undefined => {
  if (typeof sessionStorage === 'undefined') {
    return undefined;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (isNil(raw) || raw === '') {
      return undefined;
    }

    const parsed = parseSnapshot(JSON.parse(raw) as unknown);
    if (isNil(parsed)) {
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
};
