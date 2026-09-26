import axios from 'axios';
import { isNil } from 'lodash-es';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return 'Инстанс не найден. Проверьте idInstance и токен.';
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim() !== '') {
      return data;
    }

    if (!isNil(data) && typeof data === 'object' && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;
      if (typeof record.message === 'string' && record.message.trim() !== '') {
        return record.message;
      }
      if (typeof record.error === 'string' && record.error.trim() !== '') {
        return record.error;
      }
    }

    if (typeof error.message === 'string' && error.message.trim() !== '') {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }

  return 'Не удалось выполнить запрос';
};

export const isAbortError = (error: unknown): boolean => {
  if (axios.isCancel(error)) {
    return true;
  }

  return error instanceof Error && (error.name === 'AbortError' || error.name === 'CanceledError');
};

export const isCredentialError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === 401 || status === 403 || status === 404;
};

export const isFatalApiError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const message = getErrorMessage(error).toLowerCase();
  if (message.includes('webhook')) {
    return true;
  }

  const status = error.response?.status;
  return status === 401 || status === 403;
};

export const isPollerStopError = (error: unknown): boolean => {
  if (isFatalApiError(error)) {
    return true;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === 400 || status === 404;
};

export const isTransientApiError = (error: unknown): boolean => {
  if (isAbortError(error) || isFatalApiError(error) || isPollerStopError(error) || !axios.isAxiosError(error)) {
    return false;
  }

  if (isNil(error.response)) {
    return true;
  }

  const status = error.response.status;
  return status === 429 || status >= 500;
};

export const isMissingReceiptError = (error: unknown): boolean => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return true;
  }

  const message = getErrorMessage(error).toLowerCase();
  return message.includes('findunacked') || message.includes('not found');
};

export const wait = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isNil(signal) && signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (!isNil(signal)) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (!isNil(signal)) {
      signal.addEventListener('abort', onAbort);
    }
  });
};

export const nextDelay = (attempt: number): number => {
  const base = Math.min(30000, 1000 * (2 ** attempt));
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
};
