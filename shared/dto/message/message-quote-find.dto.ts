import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';

import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

export const MessageQuoteFindDto = Dto.create<MessageQuoteInterface>({
  idMessage: {
    label: 'idMessage',
    schema: idMessageSchema,
  },
  authorName: {
    label: 'Автор',
    schema: yup.string(),
  },
  text: {
    label: 'Текст цитаты',
    schema: yup.string(),
  },
  outgoing: {
    label: 'Исходящая цитата',
    schema: yup.boolean(),
  },
});
