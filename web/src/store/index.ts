import { combineReducers, configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';

import { chatsReducer } from '@web/entities/chat/model/chats-slice';
import { connectionReducer } from '@web/entities/connection/model/connection-slice';
import { sessionReducer } from '@web/entities/session/model/session-slice';
import { readSnapshot } from '@web/store/snapshot';

const rootReducer = combineReducers({
  session: sessionReducer,
  chats: chatsReducer,
  connection: connectionReducer,
});

export type RootStateInterface = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: readSnapshot(),
});

export type AppDispatchInterface = typeof store.dispatch;

export type AppThunkInterface<Return = void> = ThunkAction<
  Return,
  RootStateInterface,
  undefined,
  UnknownAction
>;
