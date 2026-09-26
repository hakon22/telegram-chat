import {
  outgoingAccepted,
  outgoingFailed,
  outgoingQueued,
  type SendMessageArgInterface } from '@web/entities/chat/model/chats-slice';
import { connectionHalted } from '@web/entities/connection/model/connection-slice';
import { loginFailed } from '@web/entities/session/model/session-slice';
import {
  getErrorMessage,
  isAbortError,
  isCredentialError,
  isFatalApiError,
  isTransientApiError,
  wait,
} from '@web/shared/api/api-error';
import { postSendMessage } from '@web/shared/api/green-api-client';

import type { AppThunkInterface } from '@web/store/index';

const SEND_ATTEMPTS = 3;

export const sendChatMessage = (arg: SendMessageArgInterface): AppThunkInterface<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(outgoingQueued(arg));
    let attempt = 0;
    let lastMessage = 'Не удалось отправить сообщение';

    while (attempt < SEND_ATTEMPTS) {
      try {
        const session = getState().session;
        const response = await postSendMessage(session, {
          chatId: `${arg.phone}@c.us`,
          message: arg.text,
          quotedMessageId: arg.quotedMessageId,
        });
        dispatch(outgoingAccepted({
          clientId: arg.clientId,
          idMessage: response.idMessage,
        }));
        return;
      } catch (error) {
        lastMessage = getErrorMessage(error);
        const stopRetry = isAbortError(error)
          || isFatalApiError(error)
          || !isTransientApiError(error)
          || attempt === SEND_ATTEMPTS - 1;

        if (stopRetry) {
          dispatch(outgoingFailed({
            clientId: arg.clientId,
            description: lastMessage,
          }));
          if (isCredentialError(error)) {
            dispatch(loginFailed(lastMessage));
            return;
          }
          if (isFatalApiError(error)) {
            dispatch(connectionHalted(lastMessage));
          }
          return;
        }

        await wait(1000 * (attempt + 1));
        attempt += 1;
      }
    }
  };
};
