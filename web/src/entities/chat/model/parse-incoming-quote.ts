import { isNil } from 'lodash-es';

import { trimQuotePreview } from '@web/shared/lib/quote-preview';

import type { MessageDataFindInterface } from '@shared/dto/message/message-data-find.dto';
import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

const digitsFromChatId = (chatId: string): string => {
  const match = chatId.match(/^(\d{10,15})@/);
  return isNil(match) ? '' : match[1];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !isNil(value) && typeof value === 'object' && !Array.isArray(value);
};

const quoteBodyText = (quoted: Record<string, unknown>): string => {
  if (typeof quoted.textMessage === 'string' && quoted.textMessage !== '') {
    return quoted.textMessage;
  }

  const textMessage = quoted.textMessage;
  if (isRecord(textMessage) && typeof textMessage.textMessage === 'string') {
    return textMessage.textMessage;
  }

  const extended = quoted.extendedTextMessageData;
  if (isRecord(extended) && typeof extended.text === 'string') {
    return extended.text;
  }

  if (typeof quoted.caption === 'string' && quoted.caption !== '') {
    return quoted.caption;
  }

  switch (quoted.typeMessage) {
    case 'imageMessage':
      return 'Фото';
    case 'videoMessage':
      return 'Видео';
    case 'documentMessage':
      return 'Документ';
    case 'audioMessage':
      return 'Аудио';
    case 'contactMessage':
      return 'Контакт';
    case 'locationMessage':
      return 'Геолокация';
    default:
      return 'Сообщение';
  }
};

const quoteAuthor = (
  participant: string,
  contactTitle: string,
  instanceWid: string,
): Pick<MessageQuoteInterface, 'authorName' | 'outgoing'> => {
  const selfDigits = digitsFromChatId(instanceWid);
  const participantDigits = digitsFromChatId(participant);
  const outgoing = selfDigits !== '' && participantDigits === selfDigits;

  return {
    authorName: outgoing ? 'Вы' : contactTitle,
    outgoing,
  };
};

export const parseIncomingQuote = (
  messageData: MessageDataFindInterface | undefined,
  contactTitle: string,
  instanceWid: string,
): MessageQuoteInterface | undefined => {
  if (isNil(messageData)) {
    return undefined;
  }

  const quoted = messageData.quotedMessage;
  if (!isRecord(quoted) || typeof quoted.stanzaId !== 'string' || quoted.stanzaId === '') {
    return undefined;
  }

  const participant = typeof quoted.participant === 'string' ? quoted.participant : '';
  const { authorName, outgoing } = quoteAuthor(participant, contactTitle, instanceWid);

  return {
    idMessage: quoted.stanzaId,
    authorName,
    text: trimQuotePreview(quoteBodyText(quoted)),
    outgoing,
  };
};

export const resolveIncomingText = (messageData?: MessageDataFindInterface): string | null => {
  if (isNil(messageData)) {
    return null;
  }

  const plain = messageData.textMessageData?.textMessage;
  if (typeof plain === 'string' && plain !== '') {
    return plain;
  }

  const extended = messageData.extendedTextMessageData;
  if (isRecord(extended) && typeof extended.text === 'string' && extended.text !== '') {
    return extended.text;
  }

  return null;
};
