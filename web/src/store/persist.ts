import { isNil } from 'lodash-es';

import { stateHydrated } from '@web/store/hydrate';
import { store } from '@web/store/index';
import { parseSnapshot, STORAGE_KEY } from '@web/store/snapshot';

let started = false;

export const startPersist = (): void => {
  if (started) {
    return;
  }

  started = true;

  store.subscribe(() => {
    const state = store.getState();
    const snapshot = {
      session: state.session,
      chats: {
        ...state.chats,
        createPending: false,
      },
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      return;
    }
  });

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY || isNil(event.newValue)) {
      return;
    }

    try {
      const snapshot = parseSnapshot(JSON.parse(event.newValue) as unknown);
      if (isNil(snapshot)) {
        return;
      }

      store.dispatch(stateHydrated(snapshot));
    } catch {
      return;
    }
  });
};
