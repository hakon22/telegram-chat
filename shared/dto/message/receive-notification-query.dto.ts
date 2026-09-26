import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Query-параметры ReceiveNotification */
export interface ReceiveNotificationQueryInterface {
  /** Таймаут long polling в секундах */
  receiveTimeout: number;
}

export const ReceiveNotificationQueryDto = Dto.create<ReceiveNotificationQueryInterface>({
  receiveTimeout: {
    label: 'receiveTimeout',
    positive: false,
    schema: yup
      .number()
      .min(1)
      .max(60),
  },
});
