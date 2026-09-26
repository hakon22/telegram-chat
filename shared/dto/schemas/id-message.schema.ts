import * as yup from 'yup';

/** Идентификатор сообщения: API может вернуть число */
export const idMessageSchema = yup.string().transform((value, originalValue) => {
  if (typeof originalValue === 'number' && Number.isFinite(originalValue)) {
    return String(originalValue);
  }
  return value;
});
