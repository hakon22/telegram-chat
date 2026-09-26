import * as yup from 'yup';

/** Российский мобильный: 11 цифр, начинается с 79 */
export const phoneSchema = yup
  .string()
  .transform((value, originalValue) => {
    const raw = typeof value === 'string'
      ? value
      : typeof originalValue === 'string'
        ? originalValue
        : '';
    return raw.replace(/[^\d]/g, '');
  })
  .length(11, 'Некорректный телефон')
  .matches(/^79/, 'Некорректный телефон');
