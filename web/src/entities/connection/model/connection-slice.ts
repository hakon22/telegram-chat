import { createSlice } from '@reduxjs/toolkit';

import { ConnectionPhaseEnum } from '@shared/enums/connection-phase.enum';

import { stateHydrated } from '@web/store/hydrate';

export interface ConnectionStateInterface {
  phase: ConnectionPhaseEnum;
  bannerMessage: string;
  booting: boolean;
}

const initialState: ConnectionStateInterface = {
  phase: ConnectionPhaseEnum.IDLE,
  bannerMessage: '',
  booting: true,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    phaseSet: (state, action: { payload: ConnectionPhaseEnum; }) => {
      state.phase = action.payload;
      if (action.payload !== ConnectionPhaseEnum.HALTED) {
        state.bannerMessage = '';
      }
    },
    connectionBackoff: state => {
      state.phase = ConnectionPhaseEnum.BACKOFF;
    },
    connectionHalted: (state, action: { payload: string; }) => {
      state.phase = ConnectionPhaseEnum.HALTED;
      state.bannerMessage = action.payload;
    },
    bootFinished: state => {
      state.booting = false;
    },
    connectionReset: () => {
      return {
        ...initialState,
        booting: false,
      };
    },
  },
  extraReducers: builder => {
    builder.addCase(stateHydrated, state => {
      state.phase = ConnectionPhaseEnum.IDLE;
      state.bannerMessage = '';
    });
  },
});

export const {
  phaseSet,
  connectionBackoff,
  connectionHalted,
  bootFinished,
  connectionReset,
} = connectionSlice.actions;

export const connectionReducer = connectionSlice.reducer;
