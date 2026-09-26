import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Данные инстанса в уведомлении */
export interface InstanceDataFindInterface {
  /** Номер инстанса */
  idInstance: number;
  /** Аккаунт инстанса */
  wid: string;
  /** Тип мессенджера */
  typeInstance: string;
}

export const InstanceDataFindDto = Dto.create<InstanceDataFindInterface>({
  idInstance: {
    label: 'idInstance',
    schema: yup.number(),
  },
  wid: {
    label: 'wid',
    schema: yup.string(),
  },
  typeInstance: {
    label: 'typeInstance',
    schema: yup.string(),
  },
});
