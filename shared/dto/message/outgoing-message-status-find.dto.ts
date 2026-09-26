import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { mapApiMessageStatus } from '@shared/dto/message/map-api-message-status';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';
import { MessageStatusEnum } from '@shared/enums/message-status.enum';

/** Статус исходящего из очереди уведомлений */
export interface OutgoingMessageStatusFindInterface {
  /** Идентификатор сообщения */
  idMessage: string;
  /** chatId Telegram */
  chatId: string;
  /** Локальный статус */
  status: MessageStatusEnum;
  /** Описание ошибки */
  description?: string;
}

const statusSchema = yup.string()
  .transform((_value, originalValue) => mapApiMessageStatus(originalValue))
  .oneOf([
    MessageStatusEnum.DELIVERED,
    MessageStatusEnum.READ,
    MessageStatusEnum.FAILED,
    MessageStatusEnum.NO_ACCOUNT,
  ], 'Неизвестный статус');

export const OutgoingMessageStatusFindDto = Dto.create<OutgoingMessageStatusFindInterface>({
  idMessage: {
    label: 'idMessage',
    schema: idMessageSchema,
  },
  chatId: {
    label: 'chatId',
    schema: yup.string(),
  },
  status: {
    label: 'Статус',
    schema: statusSchema,
  },
  description: {
    label: 'Описание',
    optional: true,
    schema: yup.string(),
  },
});
