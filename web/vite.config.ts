import path from 'path';
import { fileURLToPath } from 'url';

import { normalizeViteBasePath } from '@telegram-chat/shared/lib/base-path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { trailingBaseSlashPlugin } from '@telegram-chat/web/vite/trailing-base-slash-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const basePath = normalizeViteBasePath(process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '/telegram-chat/');
  const appPort = Number(process.env.PORT || env.PORT) || 4002;

  return {
    base: basePath,
    plugins: [trailingBaseSlashPlugin(basePath), react(), tsconfigPaths()],
    resolve: {
      alias: {
        '@web': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    server: {
      host: true,
      port: appPort,
      allowedHosts: [
        'green-api.com',
        'localhost',
        '127.0.0.1',
        '.am-projects.ru',
        'backend_servers',
      ],
    },
    preview: {
      host: true,
      port: appPort,
    },
  };
});
