import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { MessageQuoteFindDto } from '@shared/dto/message/message-quote-find.dto';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';

import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

/** Входящее текстовое сообщение личного чата */
export interface IncomingTextFindInterface {
  /** Идентификатор сообщения */
  idMessage: string;
  /** chatId Telegram */
  chatId: string;
  /** Текст */
  textMessage: string;
  /** Номер отправителя, если Telegram его отдал */
  senderPhoneNumber?: number;
  /** UNIX-время */
  timestamp?: number;
  /** Ответ на другое сообщение */
  quote?: MessageQuoteInterface;
}

export const IncomingTextFindDto = Dto.create<IncomingTextFindInterface>({
  idMessage: {
    label: 'idMessage',
    schema: idMessageSchema,
  },
  chatId: {
    label: 'chatId',
    schema: yup.string(),
  },
  textMessage: {
    label: 'Текст',
    schema: yup.string(),
  },
  senderPhoneNumber: {
    label: 'Телефон отправителя',
    optional: true,
    positive: false,
    schema: yup.number(),
  },
  timestamp: {
    label: 'Время',
    optional: true,
    positive: false,
    schema: yup.number(),
  },
  quote: {
    label: 'Цитата',
    optional: true,
    nested: () => MessageQuoteFindDto,
  },
});
