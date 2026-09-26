import * as yup from 'yup';

import type { DtoInstanceInterface } from '@shared/dto/dto.class';
import type { Rule } from 'antd/es/form';

/**
 * Обязательность поля по shared DTO (`optional !== true` → required)
 */
export const isDtoFieldRequired = (dto: DtoInstanceInterface, fieldName: string): boolean => {
  const field = dto.fields[fieldName];
  return field?.optional !== true;
};

/**
 * Ant Design Form.Item rules из shared Yup DTO (одно поле)
 */
export const yupDtoFieldRules = (dto: DtoInstanceInterface, fieldName: string): Rule[] => [
  {
    validator: async (_rule, value) => {
      try {
        await dto.schema.validateAt(fieldName, {
          [fieldName]: value,
        });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          throw new Error(error.errors[0] ?? error.message);
        }
        throw error;
      }
    },
  },
];

/**
 * Props Form.Item, синхронизированные с DTO: label, required-маркер и rules
 */
export const dtoFormItemProps = (dto: DtoInstanceInterface, fieldName: string) => {
  const field = dto.fields[fieldName];

  return {
    label: field.label,
    required: isDtoFieldRequired(dto, fieldName),
    rules: yupDtoFieldRules(dto, fieldName),
  };
};
