import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { bootFinished } from '@web/entities/connection/model/connection-slice';
import { loginFailed, loginSucceeded } from '@web/entities/session/model/session-slice';
import { getErrorMessage } from '@web/shared/api/api-error';
import { fetchInstanceState } from '@web/shared/api/green-api-client';

import type { AppThunkInterface } from '@web/store/index';

let bootstrapTask: Promise<void> | null = null;

export const bootstrapSession = (): AppThunkInterface<Promise<void>> => {
  return (dispatch, getState) => {
    if (bootstrapTask) {
      return bootstrapTask;
    }

    bootstrapTask = (async () => {
      try {
        const { session } = getState();
        const hasCredentials = session.idInstance !== '' && session.apiTokenInstance !== '';

        if (hasCredentials && session.status === SessionStatusEnum.LOADING) {
          const credentials = {
            idInstance: session.idInstance,
            apiTokenInstance: session.apiTokenInstance,
          };
          await fetchInstanceState(credentials);
          dispatch(loginSucceeded(credentials));
        }
      } catch (error) {
        dispatch(loginFailed(getErrorMessage(error)));
      } finally {
        dispatch(bootFinished());
      }
    })();

    return bootstrapTask;
  };
};
