import classNames from 'classnames';

import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

export interface MessageQuoteBlockPropsInterface {
  quote: MessageQuoteInterface;
  className?: string;
}

export const MessageQuoteBlock = ({ quote, className }: MessageQuoteBlockPropsInterface) => {
  return (
    <span
      className={classNames('message-quote', {
        'message-quote_outgoing': quote.outgoing,
      }, className)}
    >
      <span className="message-quote__author">{quote.authorName}</span>
      <span className="message-quote__text">{quote.text}</span>
    </span>
  );
};
