import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';

/** Тело SendMessage */
export interface SendMessageFormInterface {
  /** phone@c.us */
  chatId: string;
  /** Текст, до 4096 символов */
  message: string;
  /** Ответ на сообщение */
  quotedMessageId?: string;
}

export const SendMessageFormDto = Dto.create<SendMessageFormInterface>({
  chatId: {
    label: 'Чат',
    schema: yup
      .string()
      .matches(/^\d{11}@c\.us$/, 'Некорректный чат'),
  },
  message: {
    label: 'Сообщение',
    schema: yup
      .string()
      .min(1, 'Введите сообщение')
      .max(4096, 'Сообщение длиннее 4096 символов'),
  },
  quotedMessageId: {
    label: 'quotedMessageId',
    optional: true,
    schema: idMessageSchema,
  },
});
