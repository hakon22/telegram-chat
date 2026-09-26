import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { stateHydrated } from '@web/store/hydrate';

import type { InstanceCredentialsFormInterface } from '@shared/dto/auth/instance-credentials-form.dto';

export interface SessionStateInterface {
  idInstance: string;
  apiTokenInstance: string;
  status: SessionStatusEnum;
  errorMessage: string;
}

export const initialSessionState: SessionStateInterface = {
  idInstance: '',
  apiTokenInstance: '',
  status: SessionStatusEnum.IDLE,
  errorMessage: '',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState: initialSessionState,
  reducers: {
    loginStarted: state => {
      state.status = SessionStatusEnum.LOADING;
      state.errorMessage = '';
    },
    loginSucceeded: (state, action: PayloadAction<InstanceCredentialsFormInterface>) => {
      state.idInstance = action.payload.idInstance;
      state.apiTokenInstance = action.payload.apiTokenInstance;
      state.status = SessionStatusEnum.READY;
      state.errorMessage = '';
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.status = SessionStatusEnum.ERROR;
      state.errorMessage = action.payload;
    },
    sessionReset: () => {
      return initialSessionState;
    },
  },
  extraReducers: builder => {
    builder.addCase(stateHydrated, (_state, action) => {
      const session = action.payload.session;
      if (session.idInstance === '' || session.apiTokenInstance === '') {
        return initialSessionState;
      }

      return {
        ...session,
        status: SessionStatusEnum.LOADING,
        errorMessage: '',
      };
    });
  },
});

export const {
  loginStarted,
  loginSucceeded,
  loginFailed,
  sessionReset,
} = sessionSlice.actions;

export const sessionReducer = sessionSlice.reducer;
