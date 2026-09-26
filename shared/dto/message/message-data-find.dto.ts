import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { TextMessageDataFindDto, type TextMessageDataFindInterface } from '@shared/dto/message/text-message-data-find.dto';

const apiBlockSchema = yup.mixed();

/** messageData входящего уведомления */
export interface MessageDataFindInterface {
  /** textMessage и остальные типы GREEN-API */
  typeMessage: string;
  /** Заполнено у текстового сообщения */
  textMessageData?: TextMessageDataFindInterface;
  /** Текст ответа при typeMessage quotedMessage / extendedTextMessage */
  extendedTextMessageData?: Record<string, unknown>;
  /** Цитируемое сообщение (ответ) */
  quotedMessage?: Record<string, unknown>;
}

export const MessageDataFindDto = Dto.create<MessageDataFindInterface>({
  typeMessage: {
    label: 'typeMessage',
    schema: yup.string(),
  },
  textMessageData: {
    label: 'textMessageData',
    optional: true,
    nested: () => TextMessageDataFindDto,
  },
  extendedTextMessageData: {
    label: 'extendedTextMessageData',
    optional: true,
    schema: apiBlockSchema,
  },
  quotedMessage: {
    label: 'quotedMessage',
    optional: true,
    schema: apiBlockSchema,
  },
});
