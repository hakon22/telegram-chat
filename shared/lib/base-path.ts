/** Vite `base`: всегда с завершающим слэшем (кроме корня). */
export const normalizeViteBasePath = (raw: string): string => {
  if (raw === '' || raw === '/') {
    return '/';
  }

  return raw.endsWith('/') ? raw : `${raw}/`;
};

/** React Router `basename`: без завершающего слэша (кроме корня). */
export const normalizeRouterBasename = (raw: string): string => {
  const viteBase = normalizeViteBasePath(raw);

  if (viteBase === '/') {
    return '/';
  }

  return viteBase.replace(/\/$/, '');
};
