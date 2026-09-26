import { MessageStatusEnum } from '@shared/enums/message-status.enum';

const SUCCESS_RANK: Record<MessageStatusEnum, number> = {
  [MessageStatusEnum.PENDING]: 0,
  [MessageStatusEnum.SENT]: 1,
  [MessageStatusEnum.DELIVERED]: 2,
  [MessageStatusEnum.READ]: 3,
  [MessageStatusEnum.FAILED]: -1,
  [MessageStatusEnum.NO_ACCOUNT]: -1,
};

const isFailure = (status: MessageStatusEnum): boolean => {
  return status === MessageStatusEnum.FAILED || status === MessageStatusEnum.NO_ACCOUNT;
};

/** Статус не понижается. Ошибка заменяет только ожидание и отправку. */
export const canApplyStatus = (current: MessageStatusEnum, next: MessageStatusEnum): boolean => {
  if (current === next || current === MessageStatusEnum.READ) {
    return false;
  }

  if (isFailure(current)) {
    return false;
  }

  if (isFailure(next)) {
    return current === MessageStatusEnum.PENDING || current === MessageStatusEnum.SENT;
  }

  return SUCCESS_RANK[next] > SUCCESS_RANK[current];
};
