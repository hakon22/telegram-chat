import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';

import type { ChatInterface } from '@web/entities/chat/model/chats-slice';

export const countUnreadIncoming = (chat: ChatInterface): number => {
  if (chat.firstUnreadClientId === '') {
    return 0;
  }

  const startIndex = chat.messages.findIndex(({ clientId }) => clientId === chat.firstUnreadClientId);
  if (startIndex < 0) {
    return 0;
  }

  return chat.messages
    .slice(startIndex)
    .filter(({ direction }) => direction === MessageDirectionEnum.INCOMING)
    .length;
};
