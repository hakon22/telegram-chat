import { normalizeViteBasePath } from '@telegram-chat/shared/lib/base-path';

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const redirectWithoutTrailingSlash = (
  basePath: string,
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
): void => {
  const baseWithSlash = normalizeViteBasePath(basePath);

  if (baseWithSlash === '/') {
    next();
    return;
  }

  const baseNoSlash = baseWithSlash.replace(/\/$/, '');
  const [pathname, search = ''] = (req.url ?? '').split('?', 2);

  if (pathname !== baseNoSlash) {
    next();
    return;
  }

  res.writeHead(301, { Location: `${baseWithSlash}${search === '' ? '' : `?${search}`}` });
  res.end();
};

/** Dev/preview: /telegram-chat → /telegram-chat/ (в проде — редирект в nginx). */
export const trailingBaseSlashPlugin = (basePath: string): Plugin => {
  const middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void => {
    redirectWithoutTrailingSlash(basePath, req, res, next);
  };

  return {
    name: 'trailing-base-slash',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};
