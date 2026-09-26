import * as yup from 'yup';

import { Dto } from '@shared/dto/dto.class';

/** Ответ getStateInstance */
export interface InstanceStateFindInterface {
  /** Состояние инстанса */
  stateInstance: string;
}

export const InstanceStateFindDto = Dto.create<InstanceStateFindInterface>({
  stateInstance: {
    label: 'Состояние инстанса',
    schema: yup.string(),
  },
});
