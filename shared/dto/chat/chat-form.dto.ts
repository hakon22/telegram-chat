import { Dto } from '@shared/dto/dto.class';
import { phoneSchema } from '@shared/dto/schemas/phone.schema';

/** Новый чат по номеру телефона */
export interface ChatFormInterface {
  /** Телефон, 11 цифр, префикс 79 */
  phone: string;
}

export const ChatFormDto = Dto.create<ChatFormInterface>({
  phone: {
    label: 'Телефон',
    schema: phoneSchema,
  },
});
