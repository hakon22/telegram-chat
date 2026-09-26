import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';

import { formatPhone } from '@web/shared/lib/format-phone';
import { trimQuotePreview } from '@web/shared/lib/quote-preview';

import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';
import type { ChatMessageInterface } from '@web/entities/chat/model/chats-slice';

export const buildMessageQuote = (message: ChatMessageInterface, contactPhone: string): MessageQuoteInterface | null => {
  if (message.idMessage === '') {
    return null;
  }

  const outgoing = message.direction === MessageDirectionEnum.OUTGOING;

  return {
    idMessage: message.idMessage,
    authorName: outgoing ? 'Вы' : formatPhone(contactPhone),
    text: trimQuotePreview(message.text),
    outgoing,
  };
};
