import axios from 'axios';
import { isNil } from 'lodash-es';
import * as yup from 'yup';

import { InstanceStateFindDto } from '@shared/dto/auth/instance-state-find.dto';
import { ReceiveNotificationFindDto, type ReceiveNotificationFindInterface } from '@shared/dto/message/receive-notification-find.dto';
import { ReceiveNotificationQueryDto } from '@shared/dto/message/receive-notification-query.dto';
import { SendMessageFindDto, type SendMessageFindInterface } from '@shared/dto/message/send-message-find.dto';
import { SendMessageFormDto, type SendMessageFormInterface } from '@shared/dto/message/send-message-form.dto';

import type { InstanceCredentialsFormInterface } from '@shared/dto/auth/instance-credentials-form.dto';

const API_URL = import.meta.env.VITE_GREEN_API_URL || 'https://4100.api.green-api.com';
const RECEIVE_TIMEOUT_MS = 25000;

export const greenApiClient = axios.create({
  baseURL: API_URL,
  timeout: RECEIVE_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

const instancePath = (credentials: InstanceCredentialsFormInterface, method: string): string => {
  const idInstance = encodeURIComponent(credentials.idInstance);
  const token = encodeURIComponent(credentials.apiTokenInstance);
  return `/waInstance${idInstance}/${method}/${token}`;
};

const readLooseNotification = (data: unknown): ReceiveNotificationFindInterface | null => {
  if (isNil(data) || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const rawReceipt = record.receiptId;
  const receiptId = typeof rawReceipt === 'number' ? rawReceipt : Number(rawReceipt);
  if (!Number.isInteger(receiptId) || receiptId <= 0) {
    return null;
  }

  return {
    receiptId,
  };
};

export const fetchInstanceState = async (credentials: InstanceCredentialsFormInterface, signal?: AbortSignal): Promise<void> => {
  const response = await greenApiClient.get(
    instancePath(credentials, 'getStateInstance'),
    {
      signal,
      timeout: 15000,
    },
  );

  InstanceStateFindDto.parseSync(response.data);
};

export const postSendMessage = async (
  credentials: InstanceCredentialsFormInterface,
  body: SendMessageFormInterface,
  signal?: AbortSignal,
): Promise<SendMessageFindInterface> => {
  const payload = SendMessageFormDto.parseSync(body);
  const response = await greenApiClient.post(
    instancePath(credentials, 'sendMessage'),
    payload,
    { signal },
  );

  return SendMessageFindDto.parseSync(response.data);
};

export const fetchNotification = async (
  credentials: InstanceCredentialsFormInterface,
  signal: AbortSignal,
): Promise<ReceiveNotificationFindInterface | null> => {
  const query = ReceiveNotificationQueryDto.parseSync({ receiveTimeout: 20 });
  const response = await greenApiClient.get(
    instancePath(credentials, 'receiveNotification'),
    {
      signal,
      timeout: RECEIVE_TIMEOUT_MS,
      params: query,
    },
  );

  if (isNil(response.data) || response.data === '') {
    return null;
  }

  try {
    return ReceiveNotificationFindDto.parseSync(response.data);
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      throw error;
    }

    const loose = readLooseNotification(response.data);
    if (isNil(loose)) {
      throw error;
    }

    return loose;
  }
};

export const deleteNotification = async (
  credentials: InstanceCredentialsFormInterface,
  receiptId: number,
  signal: AbortSignal,
): Promise<void> => {
  await greenApiClient.delete(
    `${instancePath(credentials, 'deleteNotification')}/${receiptId}`,
    {
      signal,
      timeout: 15000,
    },
  );
};
