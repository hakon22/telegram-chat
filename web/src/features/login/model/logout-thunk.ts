import { chatsReset } from '@web/entities/chat/model/chats-slice';
import { connectionReset } from '@web/entities/connection/model/connection-slice';
import { sessionReset } from '@web/entities/session/model/session-slice';
import { stopPoller } from '@web/features/poller/model/poller-thunk';

import type { AppThunkInterface } from '@web/store/index';

export const logout = (): AppThunkInterface => {
  return dispatch => {
    dispatch(stopPoller());
    dispatch(chatsReset());
    dispatch(sessionReset());
    dispatch(connectionReset());
  };
};
