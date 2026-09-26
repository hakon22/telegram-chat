import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Учётные данные инстанса GREEN-API */
export interface InstanceCredentialsFormInterface {
  /** Номер инстанса */
  idInstance: string;
  /** Ключ доступа */
  apiTokenInstance: string;
}

export const InstanceCredentialsFormDto = Dto.create<InstanceCredentialsFormInterface>({
  idInstance: {
    label: 'ID инстанса',
    schema: yup
      .string()
      .matches(/^\d+$/, 'ID инстанса должен состоять из цифр'),
  },
  apiTokenInstance: {
    label: 'Токен API',
    schema: yup
      .string()
      .min(1, 'Токен API обязателен'),
  },
});
