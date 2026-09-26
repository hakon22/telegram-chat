import * as yup from 'yup';

import { InstanceCredentialsFormDto, type InstanceCredentialsFormInterface } from '@shared/dto/auth/instance-credentials-form.dto';

import { chatsReset } from '@web/entities/chat/model/chats-slice';
import { loginFailed, loginStarted, loginSucceeded } from '@web/entities/session/model/session-slice';
import { getErrorMessage } from '@web/shared/api/api-error';
import { fetchInstanceState } from '@web/shared/api/green-api-client';

import type { AppThunkInterface } from '@web/store/index';

export const submitLogin = (raw: InstanceCredentialsFormInterface): AppThunkInterface<Promise<void>> => {
  return async (dispatch, getState) => {
    dispatch(loginStarted());

    try {
      const credentials = InstanceCredentialsFormDto.parseSync(raw);
      await fetchInstanceState(credentials);
      const previous = getState().session.idInstance;
      if (previous !== '' && previous !== credentials.idInstance) {
        dispatch(chatsReset());
      }
      dispatch(loginSucceeded(credentials));
    } catch (error) {
      const message = error instanceof yup.ValidationError
        ? (error.errors[0] ?? error.message)
        : getErrorMessage(error);
      dispatch(loginFailed(message));
    }
  };
};
