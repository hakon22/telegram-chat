import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Отправитель входящего сообщения */
export interface SenderDataFindInterface {
  /** chatId Telegram */
  chatId: string;
  /** user или группа */
  chatType: string;
  /** Идентификатор отправителя */
  sender: string;
  /** Имя чата */
  chatName?: string;
  /** Имя отправителя */
  senderName?: string;
  /** Телефон, 0 если Telegram его скрыл */
  senderPhoneNumber?: number;
}

export const SenderDataFindDto = Dto.create<SenderDataFindInterface>({
  chatId: {
    label: 'chatId',
    schema: yup.string(),
  },
  chatType: {
    label: 'chatType',
    schema: yup.string(),
  },
  sender: {
    label: 'sender',
    schema: yup.string(),
  },
  chatName: {
    label: 'chatName',
    optional: true,
    schema: yup.string(),
  },
  senderName: {
    label: 'senderName',
    optional: true,
    schema: yup.string(),
  },
  senderPhoneNumber: {
    label: 'Телефон отправителя',
    optional: true,
    positive: false,
    schema: yup.number(),
  },
});
