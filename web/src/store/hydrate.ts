import { createAction } from '@reduxjs/toolkit';

import type { ChatsStateInterface } from '@web/entities/chat/model/chats-slice';
import type { SessionStateInterface } from '@web/entities/session/model/session-slice';

export interface PersistedStateInterface {
  session: SessionStateInterface;
  chats: ChatsStateInterface;
}

export const stateHydrated = createAction<PersistedStateInterface>('state/hydrated');
