import { Tooltip } from 'antd';
import classNames from 'classnames';

import { formatMessageTooltip } from '@web/shared/lib/format-time';
import { useIsMobile } from '@web/shared/lib/use-is-mobile';
import { MessageMeta } from '@web/shared/ui/message-meta';
import { MessageQuoteBlock } from '@web/shared/ui/message-quote-block';

import type { ChatMessageInterface } from '@web/entities/chat/model/chats-slice';

export interface BubbleMessagePropsInterface {
  message: ChatMessageInterface;
}

export const BubbleMessage = ({ message }: BubbleMessagePropsInterface) => {
  const isMobile = useIsMobile();
  const hasQuote = message.quote !== undefined;
  const tooltip = formatMessageTooltip(message.createdAt);

  const bubble = (
    <span className={classNames('bubble-message', { 'bubble-message_has-quote': hasQuote })}>
      {hasQuote && message.quote !== undefined && (
        <span className="bubble-message__quote">
          <MessageQuoteBlock quote={message.quote} />
        </span>
      )}
      <span className="bubble-message__body">
        <span className="bubble-message__text">{message.text.trimEnd()}</span>
        <span className="bubble-message__meta">
          <MessageMeta message={message} />
        </span>
      </span>
    </span>
  );

  if (tooltip === '' || isMobile) {
    return bubble;
  }

  return (
    <Tooltip title={tooltip} placement="top" mouseEnterDelay={0.45}>
      {bubble}
    </Tooltip>
  );
};
