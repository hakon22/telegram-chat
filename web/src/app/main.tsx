import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { BootScreen } from '@web/app/boot-screen';
import { AppProviders } from '@web/app/providers';
import { bootstrapSession } from '@web/features/session/model/bootstrap-session-thunk';
import { store } from '@web/store/index';
import { startPersist } from '@web/store/persist';

import '@web/styles/global.scss';

startPersist();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <BootScreen />
    </Provider>
  </StrictMode>,
);

const mountApp = (): void => {
  root.render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  );
};

store
  .dispatch(bootstrapSession())
  .then(mountApp)
  .catch(mountApp);
