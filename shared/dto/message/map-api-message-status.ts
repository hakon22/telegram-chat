import { MessageStatusEnum } from '@shared/enums/message-status.enum';

const API_STATUS_MAP: Record<string, MessageStatusEnum> = {
  delivered: MessageStatusEnum.DELIVERED,
  read: MessageStatusEnum.READ,
  failed: MessageStatusEnum.FAILED,
  noAccount: MessageStatusEnum.NO_ACCOUNT,
};

/** Строка GREEN-API = локальный статус. Чужое значение остаётся как есть и не пройдёт oneOf. */
export const mapApiMessageStatus = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return API_STATUS_MAP[value] ?? value;
};
