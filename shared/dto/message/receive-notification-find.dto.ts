import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';
import { NotificationBodyFindDto, type NotificationBodyFindInterface } from '@shared/dto/message/notification-body-find.dto';

export interface ReceiveNotificationFindInterface {
  /** Идентификатор для DeleteNotification */
  receiptId: number;
  /** Тело вебхука. Пустое тело подтверждаем и пропускаем */
  body?: NotificationBodyFindInterface;
}

export const ReceiveNotificationFindDto = Dto.create<ReceiveNotificationFindInterface>({
  receiptId: {
    label: 'receiptId',
    schema: yup.number(),
  },
  body: {
    label: 'Тело',
    optional: true,
    nested: () => NotificationBodyFindDto,
  },
});
