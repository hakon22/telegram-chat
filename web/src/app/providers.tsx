import { App as AntdApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { normalizeRouterBasename } from '@shared/lib/base-path';

import { AppRoot } from '@web/app/app';
import { AppSpinner } from '@web/shared/ui/app-spinner';
import { store } from '@web/store/index';

const routerBasename = normalizeRouterBasename(import.meta.env.BASE_URL || '/telegram-chat/');

export const AppProviders = () => {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={ruRU}
        spin={{
          indicator: <AppSpinner />,
        }}
        theme={{
          token: {
            colorPrimary: '#3390ec',
            colorText: '#000000',
            colorTextSecondary: '#707579',
            colorBorder: '#dadce0',
            borderRadius: 10,
            fontFamily: 'Roboto, sans-serif',
          },
        }}
      >
        <AntdApp>
          <BrowserRouter basename={routerBasename}>
            <AppRoot />
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  );
};
