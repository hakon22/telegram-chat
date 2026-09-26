import { Dto } from '@shared/dto/dto.class';
import { idMessageSchema } from '@shared/dto/schemas/id-message.schema';

/** Ответ SendMessage */
export interface SendMessageFindInterface {
  /** Идентификатор отправленного сообщения */
  idMessage: string;
}

export const SendMessageFindDto = Dto.create<SendMessageFindInterface>({
  idMessage: {
    label: 'idMessage',
    schema: idMessageSchema,
  },
});
