import { isNil } from 'lodash-es';

import { ConnectionPhaseEnum } from '@shared/enums/connection-phase.enum';
import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { notificationReceived } from '@web/entities/chat/model/chats-slice';
import { classifyNotification } from '@web/entities/chat/model/classify-notification';
import { connectionBackoff, connectionHalted, phaseSet } from '@web/entities/connection/model/connection-slice';
import { loginFailed } from '@web/entities/session/model/session-slice';
import {
  getErrorMessage,
  isAbortError,
  isCredentialError,
  isFatalApiError,
  isMissingReceiptError,
  isPollerStopError,
  isTransientApiError,
  nextDelay,
  wait,
} from '@web/shared/api/api-error';
import { deleteNotification, fetchNotification } from '@web/shared/api/green-api-client';

import type { InstanceCredentialsFormInterface } from '@shared/dto/auth/instance-credentials-form.dto';
import type { AppThunkInterface } from '@web/store/index';

let activeLoopId = 0;
let activeController: AbortController | null = null;

const deleteUntilAck = async (
  credentials: InstanceCredentialsFormInterface,
  receiptId: number,
  signal: AbortSignal,
  dispatch: (action: ReturnType<typeof connectionBackoff>) => void,
): Promise<void> => {
  let attempt = 0;

  while (!signal.aborted) {
    try {
      await deleteNotification(credentials, receiptId, signal);
      return;
    } catch (error) {
      if (isAbortError(error) || isFatalApiError(error) || isMissingReceiptError(error)) {
        if (isMissingReceiptError(error)) {
          return;
        }
        throw error;
      }

      if (!isTransientApiError(error) && attempt > 0) {
        throw error;
      }

      dispatch(connectionBackoff());
      await wait(nextDelay(attempt), signal);
      attempt += 1;
    }
  }
};

export const stopPoller = (): AppThunkInterface => {
  return dispatch => {
    activeLoopId = 0;
    if (!isNil(activeController)) {
      activeController.abort();
      activeController = null;
    }
    dispatch(phaseSet(ConnectionPhaseEnum.IDLE));
  };
};

export const startPoller = (): AppThunkInterface<Promise<void>> => {
  return async (dispatch, getState) => {
    if (activeLoopId !== 0) {
      return;
    }

    const myId = Date.now();
    activeLoopId = myId;
    const controller = new AbortController();
    activeController = controller;

    const finish = () => {
      if (activeLoopId === myId) {
        activeLoopId = 0;
        activeController = null;
      }
    };

    const run = async () => {
      let backoffAttempt = 0;

      while (activeLoopId === myId && !controller.signal.aborted) {
        const { session } = getState();
        if (session.status !== SessionStatusEnum.READY) {
          break;
        }

        dispatch(phaseSet(ConnectionPhaseEnum.RECEIVING));

        try {
          const envelope = await fetchNotification(session, controller.signal);
          backoffAttempt = 0;

          if (isNil(envelope)) {
            continue;
          }

          dispatch(phaseSet(ConnectionPhaseEnum.APPLYING));
          const classified = classifyNotification(envelope.body);
          dispatch(notificationReceived({
            receiptId: envelope.receiptId,
            classified,
          }));
          dispatch(phaseSet(ConnectionPhaseEnum.DELETING));
          await deleteUntilAck(session, envelope.receiptId, controller.signal, dispatch);
        } catch (error) {
          if (isAbortError(error) || controller.signal.aborted) {
            break;
          }

          if (isCredentialError(error)) {
            dispatch(loginFailed(getErrorMessage(error)));
            break;
          }

          if (isPollerStopError(error)) {
            dispatch(connectionHalted(getErrorMessage(error)));
            break;
          }

          dispatch(connectionBackoff());
          await wait(nextDelay(backoffAttempt), controller.signal);
          backoffAttempt += 1;
        }
      }
    };

    try {
      const { session } = getState();
      const lockName = `telegram-chat-${session.idInstance}`;

      if (typeof navigator.locks === 'undefined') {
        await run();
        return;
      }

      await navigator.locks.request(lockName, { signal: controller.signal }, async () => {
        if (activeLoopId !== myId) {
          return;
        }
        await run();
      });
    } catch (error) {
      if (!isAbortError(error)) {
        dispatch(connectionHalted(getErrorMessage(error)));
      }
    } finally {
      finish();
    }
  };
};
