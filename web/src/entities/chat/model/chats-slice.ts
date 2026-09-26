import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { isNil } from 'lodash-es';

import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';
import { MessageStatusEnum } from '@shared/enums/message-status.enum';
import { NotificationKindEnum } from '@shared/enums/notification-kind.enum';

import { canApplyStatus } from '@web/entities/chat/model/message-status';
import { buildMessageQuote } from '@web/shared/lib/build-message-quote';
import { fromUnixSecondsOrNow, nowIso } from '@web/shared/lib/date-time';
import { stateHydrated } from '@web/store/hydrate';

import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';
import type { ClassifiedNotificationType } from '@web/entities/chat/model/classify-notification';

export interface ChatMessageInterface {
  clientId: string;
  idMessage: string;
  text: string;
  direction: MessageDirectionEnum;
  status: MessageStatusEnum;
  createdAt: string;
  errorDescription: string;
  quote?: MessageQuoteInterface;
}

export interface ChatInterface {
  phone: string;
  telegramChatId: string;
  messages: ChatMessageInterface[];
  unreadCount: number;
  /** clientId первого непрочитанного входящего в текущей «пачке» */
  firstUnreadClientId: string;
  updatedAt: string;
}

export interface EarlyStatusInterface {
  idMessage: string;
  status: MessageStatusEnum;
  description: string;
}

export interface ChatsStateInterface {
  items: ChatInterface[];
  activePhone: string;
  createPending: boolean;
  seenReceiptIds: number[];
  earlyStatuses: EarlyStatusInterface[];
}

export interface SendMessageArgInterface {
  phone: string;
  text: string;
  clientId: string;
  quotedMessageId?: string;
  quote?: MessageQuoteInterface;
}

export interface NotificationReceivedInterface {
  receiptId: number;
  classified: ClassifiedNotificationType;
}

const RECEIPT_LIMIT = 200;
const EARLY_STATUS_LIMIT = 50;

export const initialChatsState: ChatsStateInterface = {
  items: [],
  activePhone: '',
  createPending: false,
  seenReceiptIds: [],
  earlyStatuses: [],
};

const sortChats = (items: ChatInterface[]): void => {
  items.sort((left, right) => {
    if (left.updatedAt === right.updatedAt) {
      return 0;
    }

    return left.updatedAt < right.updatedAt ? 1 : -1;
  });
};

const findChatByPhone = (items: ChatInterface[], phone: string): ChatInterface | undefined => {
  return items.find(item => item.phone === phone);
};

const rememberReceipt = (state: ChatsStateInterface, receiptId: number): boolean => {
  if (state.seenReceiptIds.includes(receiptId)) {
    return false;
  }

  state.seenReceiptIds.push(receiptId);
  if (state.seenReceiptIds.length > RECEIPT_LIMIT) {
    state.seenReceiptIds.splice(0, state.seenReceiptIds.length - RECEIPT_LIMIT);
  }

  return true;
};

const applyStatusToMessage = (message: ChatMessageInterface, status: MessageStatusEnum, description: string): boolean => {
  if (!canApplyStatus(message.status, status)) {
    return false;
  }

  message.status = status;
  if (description !== '') {
    message.errorDescription = description;
  }

  return true;
};

const takeEarlyStatus = (state: ChatsStateInterface, idMessage: string): EarlyStatusInterface | undefined => {
  const found = state.earlyStatuses.find(item => item.idMessage === idMessage);
  if (isNil(found)) {
    return undefined;
  }

  state.earlyStatuses = state.earlyStatuses.filter(item => item.idMessage !== idMessage);
  return found;
};

const rememberEarlyStatus = (state: ChatsStateInterface, status: EarlyStatusInterface): void => {
  const existing = state.earlyStatuses.find(item => item.idMessage === status.idMessage);
  if (!isNil(existing)) {
    if (canApplyStatus(existing.status, status.status)) {
      existing.status = status.status;
      existing.description = status.description;
    }
    return;
  }

  state.earlyStatuses.push(status);
  if (state.earlyStatuses.length > EARLY_STATUS_LIMIT) {
    state.earlyStatuses.splice(0, state.earlyStatuses.length - EARLY_STATUS_LIMIT);
  }
};

const senderPhone = (value: number | undefined): string => {
  if (isNil(value) || value <= 0) {
    return '';
  }

  return String(value);
};

const applyText = (state: ChatsStateInterface, classified: ClassifiedNotificationType): void => {
  if (classified.kind !== NotificationKindEnum.TEXT) {
    return;
  }

  const phone = senderPhone(classified.message.senderPhoneNumber);
  const telegramChatId = classified.message.chatId;
  const chat = state.items.find(item => {
    if (phone !== '' && item.phone === phone) {
      return true;
    }

    return telegramChatId !== '' && item.telegramChatId === telegramChatId;
  });

  if (isNil(chat)) {
    return;
  }

  const already = chat.messages.some(message => message.idMessage === classified.message.idMessage);
  if (already) {
    return;
  }

  if (telegramChatId !== '') {
    chat.telegramChatId = telegramChatId;
  }

  const createdAt = fromUnixSecondsOrNow(classified.message.timestamp);

  const clientId = classified.message.idMessage;

  let quote = classified.message.quote;
  if (!isNil(quote)) {
    const quoteId = quote.idMessage;
    const quotedMessage = chat.messages.find(({ idMessage }) => idMessage === quoteId);
    if (!isNil(quotedMessage)) {
      const localQuote = buildMessageQuote(quotedMessage, chat.phone);
      if (localQuote !== null) {
        quote = localQuote;
      }
    }
  }

  chat.messages.push({
    clientId,
    idMessage: classified.message.idMessage,
    text: classified.message.textMessage,
    direction: MessageDirectionEnum.INCOMING,
    status: MessageStatusEnum.SENT,
    createdAt,
    errorDescription: '',
    quote,
  });
  chat.updatedAt = createdAt;

  if (state.activePhone !== chat.phone) {
    chat.unreadCount += 1;
    if (chat.firstUnreadClientId === '') {
      chat.firstUnreadClientId = clientId;
    }
  }

  sortChats(state.items);
};

const applyStatus = (state: ChatsStateInterface, classified: ClassifiedNotificationType): void => {
  if (classified.kind !== NotificationKindEnum.STATUS) {
    return;
  }

  const message = state.items
    .flatMap(chat => chat.messages)
    .find(item => (
      item.idMessage === classified.idMessage
      && item.direction === MessageDirectionEnum.OUTGOING
    ));

  if (isNil(message)) {
    rememberEarlyStatus(state, {
      idMessage: classified.idMessage,
      status: classified.status,
      description: classified.description,
    });
    return;
  }

  const chat = state.items.find(item => item.messages.some(entry => entry.clientId === message.clientId));
  if (applyStatusToMessage(message, classified.status, classified.description) && !isNil(chat)) {
    chat.updatedAt = nowIso();
    if (classified.chatId !== '') {
      chat.telegramChatId = classified.chatId;
    }
    sortChats(state.items);
  }
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState: initialChatsState,
  reducers: {
    activeChatSet: (state, action: PayloadAction<string>) => {
      state.activePhone = action.payload;
      const chat = findChatByPhone(state.items, action.payload);
      if (!isNil(chat)) {
        chat.unreadCount = 0;
      }
    },
    chatMarkedRead: (state, action: PayloadAction<string>) => {
      const chat = findChatByPhone(state.items, action.payload);
      if (isNil(chat)) {
        return;
      }

      chat.firstUnreadClientId = '';
      chat.unreadCount = 0;
    },
    chatEnsureFirstUnread: (state, action: PayloadAction<{ phone: string; clientId: string; }>) => {
      const chat = findChatByPhone(state.items, action.payload.phone);
      if (isNil(chat) || chat.firstUnreadClientId !== '') {
        return;
      }

      chat.firstUnreadClientId = action.payload.clientId;
    },
    chatsReset: () => {
      return initialChatsState;
    },
    createPendingSet: (state, action: PayloadAction<boolean>) => {
      state.createPending = action.payload;
    },
    outgoingQueued: (state, action: PayloadAction<SendMessageArgInterface>) => {
      const chat = findChatByPhone(state.items, action.payload.phone);
      if (isNil(chat)) {
        return;
      }

      const existing = chat.messages.find(message => message.clientId === action.payload.clientId);
      if (!isNil(existing)) {
        existing.status = MessageStatusEnum.PENDING;
        existing.errorDescription = '';
        existing.text = action.payload.text;
        existing.quote = action.payload.quote;
        return;
      }

      const createdAt = nowIso();
      chat.messages.push({
        clientId: action.payload.clientId,
        idMessage: '',
        text: action.payload.text,
        direction: MessageDirectionEnum.OUTGOING,
        status: MessageStatusEnum.PENDING,
        createdAt,
        errorDescription: '',
        quote: action.payload.quote,
      });
      chat.updatedAt = createdAt;
      sortChats(state.items);
    },
    outgoingAccepted: (state, action: PayloadAction<{ clientId: string; idMessage: string; }>) => {
      const chat = state.items.find(item => item.messages.some(message => message.clientId === action.payload.clientId));
      if (isNil(chat)) {
        return;
      }

      const message = chat.messages.find(item => item.clientId === action.payload.clientId);
      if (isNil(message)) {
        return;
      }

      message.idMessage = action.payload.idMessage;
      applyStatusToMessage(message, MessageStatusEnum.SENT, '');
      const early = takeEarlyStatus(state, action.payload.idMessage);
      if (!isNil(early)) {
        applyStatusToMessage(message, early.status, early.description);
      }
    },
    outgoingFailed: (state, action: PayloadAction<{ clientId: string; description: string; }>) => {
      const message = state.items
        .flatMap(chat => chat.messages)
        .find(item => item.clientId === action.payload.clientId);

      if (isNil(message)) {
        return;
      }

      applyStatusToMessage(message, MessageStatusEnum.FAILED, action.payload.description);
    },
    notificationReceived: (state, action: PayloadAction<NotificationReceivedInterface>) => {
      if (!rememberReceipt(state, action.payload.receiptId)) {
        return;
      }

      if (action.payload.classified.kind === NotificationKindEnum.TEXT) {
        applyText(state, action.payload.classified);
        return;
      }

      if (action.payload.classified.kind === NotificationKindEnum.STATUS) {
        applyStatus(state, action.payload.classified);
      }
    },
    chatCreated: (state, action: PayloadAction<string>) => {
      const phone = action.payload;
      const existing = findChatByPhone(state.items, phone);
      state.createPending = false;
      state.activePhone = phone;

      if (!isNil(existing)) {
        existing.unreadCount = 0;
        return;
      }

      state.items.unshift({
        phone,
        telegramChatId: '',
        messages: [],
        unreadCount: 0,
        firstUnreadClientId: '',
        updatedAt: nowIso(),
      });
    },
  },
  extraReducers: builder => {
    builder.addCase(stateHydrated, (_state, action) => {
      return {
        ...action.payload.chats,
        createPending: false,
      };
    });
  },
});

export const {
  activeChatSet,
  chatMarkedRead,
  chatEnsureFirstUnread,
  chatsReset,
  createPendingSet,
  outgoingQueued,
  outgoingAccepted,
  outgoingFailed,
  notificationReceived,
  chatCreated,
} = chatsSlice.actions;

export const chatsReducer = chatsSlice.reducer;
