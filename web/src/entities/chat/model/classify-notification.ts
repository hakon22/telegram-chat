import { isNil } from 'lodash-es';
import * as yup from 'yup';

import { IncomingTextFindDto, type IncomingTextFindInterface } from '@shared/dto/message/incoming-text-find.dto';
import { OutgoingMessageStatusFindDto } from '@shared/dto/message/outgoing-message-status-find.dto';
import { NotificationKindEnum } from '@shared/enums/notification-kind.enum';

import { parseIncomingQuote, resolveIncomingText } from '@web/entities/chat/model/parse-incoming-quote';

import type { NotificationBodyFindInterface } from '@shared/dto/message/notification-body-find.dto';
import type { MessageStatusEnum } from '@shared/enums/message-status.enum';

export interface ClassifiedTextInterface {
  kind: NotificationKindEnum.TEXT;
  message: IncomingTextFindInterface;
}

export interface ClassifiedStatusInterface {
  kind: NotificationKindEnum.STATUS;
  idMessage: string;
  chatId: string;
  status: MessageStatusEnum;
  description: string;
}

export interface ClassifiedIgnoreInterface {
  kind: NotificationKindEnum.IGNORE;
}

export type ClassifiedNotificationType = ClassifiedTextInterface | ClassifiedStatusInterface | ClassifiedIgnoreInterface;

/** Входящий текст, статус исходящего или пропуск. Ошибка разбора не роняет опрос. */
export const classifyNotification = (body?: NotificationBodyFindInterface): ClassifiedNotificationType => {
  if (isNil(body)) {
    return { kind: NotificationKindEnum.IGNORE };
  }

  if (body.typeWebhook === 'outgoingMessageStatus') {
    try {
      const parsed = OutgoingMessageStatusFindDto.parseSync({
        idMessage: body.idMessage,
        chatId: body.chatId,
        status: body.status,
        description: body.description,
      });

      return {
        kind: NotificationKindEnum.STATUS,
        idMessage: parsed.idMessage,
        chatId: parsed.chatId,
        status: parsed.status,
        description: isNil(parsed.description) ? '' : parsed.description,
      };
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return { kind: NotificationKindEnum.IGNORE };
      }
      throw error;
    }
  }

  if (body.typeWebhook !== 'incomingMessageReceived') {
    return { kind: NotificationKindEnum.IGNORE };
  }

  const senderData = body.senderData;
  const messageData = body.messageData;
  const textMessage = resolveIncomingText(messageData);

  if (isNil(senderData) || isNil(messageData) || isNil(textMessage)) {
    return { kind: NotificationKindEnum.IGNORE };
  }

  if (senderData.chatType !== 'user') {
    return { kind: NotificationKindEnum.IGNORE };
  }

  const allowedTypes = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage']);
  if (!allowedTypes.has(messageData.typeMessage)) {
    return { kind: NotificationKindEnum.IGNORE };
  }

  const contactTitle = senderData.senderName !== '' && !isNil(senderData.senderName)
    ? senderData.senderName
    : (senderData.chatName ?? 'Контакт');
  const instanceWid = body.instanceData?.wid ?? '';
  const quote = parseIncomingQuote(messageData, contactTitle, instanceWid);

  try {
    const parsed = IncomingTextFindDto.parseSync({
      idMessage: body.idMessage,
      chatId: senderData.chatId,
      textMessage,
      senderPhoneNumber: senderData.senderPhoneNumber,
      timestamp: body.timestamp,
      quote,
    });

    return {
      kind: NotificationKindEnum.TEXT,
      message: parsed,
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { kind: NotificationKindEnum.IGNORE };
    }
    throw error;
  }
};
