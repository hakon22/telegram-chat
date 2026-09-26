import { isNil } from 'lodash-es';
import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { InstanceDataFindDto, type InstanceDataFindInterface } from '@shared/dto/message/instance-data-find.dto';
import { mapApiMessageStatus } from '@shared/dto/message/map-api-message-status';
import { MessageDataFindDto, type MessageDataFindInterface } from '@shared/dto/message/message-data-find.dto';
import { SenderDataFindDto, type SenderDataFindInterface } from '@shared/dto/message/sender-data-find.dto';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';
import { MessageStatusEnum } from '@shared/enums/message-status.enum';

const knownStatuses = [
  MessageStatusEnum.DELIVERED,
  MessageStatusEnum.READ,
  MessageStatusEnum.FAILED,
  MessageStatusEnum.NO_ACCOUNT,
];

/** Неизвестный status не валит весь конверт: для чужого вебхука поле просто пустое. */
const optionalStatusSchema = yup.string().transform((_value, originalValue) => {
  if (isNil(originalValue) || originalValue === '') {
    return undefined;
  }

  const mapped = mapApiMessageStatus(originalValue);
  if (typeof mapped !== 'string' || !knownStatuses.includes(mapped as MessageStatusEnum)) {
    return undefined;
  }

  return mapped;
});

/**
 * Тело уведомления GREEN-API.
 * Общие поля есть у всех вебхуков, senderData и messageData — у входящих,
 * chatId и status — у outgoingMessageStatus.
 */
export interface NotificationBodyFindInterface {
  /** Тип уведомления */
  typeWebhook: string;
  /** Инстанс */
  instanceData?: InstanceDataFindInterface;
  /** UNIX-время */
  timestamp?: number;
  /** Идентификатор сообщения */
  idMessage?: string;
  /** chatId для статуса исходящего */
  chatId?: string;
  /** Статус исходящего */
  status?: MessageStatusEnum;
  /** Текст ошибки статуса */
  description?: string;
  /** Отправитель входящего */
  senderData?: SenderDataFindInterface;
  /** Содержимое входящего */
  messageData?: MessageDataFindInterface;
}

export const NotificationBodyFindDto = Dto.create<NotificationBodyFindInterface>({
  typeWebhook: {
    label: 'typeWebhook',
    schema: yup.string(),
  },
  instanceData: {
    label: 'instanceData',
    optional: true,
    nested: () => InstanceDataFindDto,
  },
  timestamp: {
    label: 'Время',
    optional: true,
    positive: false,
    schema: yup.number(),
  },
  idMessage: {
    label: 'idMessage',
    optional: true,
    schema: idMessageSchema,
  },
  chatId: {
    label: 'chatId',
    optional: true,
    schema: yup.string(),
  },
  status: {
    label: 'Статус',
    optional: true,
    schema: optionalStatusSchema,
  },
  description: {
    label: 'Описание',
    optional: true,
    schema: yup.string(),
  },
  senderData: {
    label: 'senderData',
    optional: true,
    nested: () => SenderDataFindDto,
  },
  messageData: {
    label: 'messageData',
    optional: true,
    nested: () => MessageDataFindDto,
  },
});
