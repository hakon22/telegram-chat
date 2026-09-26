import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Текст входящего сообщения */
export interface TextMessageDataFindInterface {
  /** Текст */
  textMessage: string;
  /** Пересланное сообщение */
  isForwarded?: boolean;
  /** Сколько раз переслали */
  forwardingScore?: number;
}

export const TextMessageDataFindDto = Dto.create<TextMessageDataFindInterface>({
  textMessage: {
    label: 'Текст',
    schema: yup.string(),
  },
  isForwarded: {
    label: 'Переслано',
    optional: true,
    schema: yup.boolean(),
  },
  forwardingScore: {
    label: 'Число пересылок',
    optional: true,
    positive: false,
    schema: yup.number(),
  },
});
