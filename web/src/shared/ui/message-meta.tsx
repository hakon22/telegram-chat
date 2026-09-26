import { Tooltip } from 'antd';

import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';
import { MessageStatusEnum } from '@shared/enums/message-status.enum';

import { formatMessageTime } from '@web/shared/lib/format-time';
import { AppSpinner } from '@web/shared/ui/app-spinner';

import type { ChatMessageInterface } from '@web/entities/chat/model/chats-slice';

export interface MessageMetaPropsInterface {
  message: ChatMessageInterface;
}

const CheckMark = ({ read }: { read: boolean; }) => {
  return (
    <svg className={read ? 'checks checks_read' : 'checks'} viewBox="0 0 18 12" aria-hidden="true">
      <path d="M1.2 6.2 L4.4 9.4 L10.2 2.2" />
      <path d="M6.2 6.4 L9.2 9.4 L16.6 2" />
    </svg>
  );
};

const SingleCheck = () => {
  return (
    <svg className="checks" viewBox="0 0 14 12" aria-hidden="true">
      <path d="M1.2 6.2 L4.8 9.6 L12.6 1.6" />
    </svg>
  );
};

export const MessageMeta = ({ message }: MessageMetaPropsInterface) => {
  const time = formatMessageTime(message.createdAt);
  const outgoing = message.direction === MessageDirectionEnum.OUTGOING;
  const failed = message.status === MessageStatusEnum.FAILED || message.status === MessageStatusEnum.NO_ACCOUNT;
  const description = message.errorDescription === ''
    ? 'Не удалось отправить'
    : message.errorDescription;

  return (
    <span className="meta">
      <span className="meta__time">{time}</span>
      {outgoing && message.status === MessageStatusEnum.PENDING && <AppSpinner size="meta" />}
      {outgoing && message.status === MessageStatusEnum.SENT && <SingleCheck />}
      {outgoing && message.status === MessageStatusEnum.DELIVERED && <CheckMark read={false} />}
      {outgoing && message.status === MessageStatusEnum.READ && <CheckMark read />}
      {outgoing && failed && (
        <Tooltip title={description}>
          <span className="meta__failed" aria-label={description}>!</span>
        </Tooltip>
      )}
    </span>
  );
};
