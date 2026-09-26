import { AudioOutlined, CloseOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons';
import { Sender } from '@ant-design/x';
import { Popover, Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { sendChatMessage } from '@web/features/send-message/model/send-message-thunk';
import { useIsMobile } from '@web/shared/lib/use-is-mobile';
import { MessageQuoteBlock } from '@web/shared/ui/message-quote-block';
import { TelegramSendIcon } from '@web/shared/ui/telegram-send-icon';
import { useAppDispatch } from '@web/store/hooks';

import type { SenderRef } from '@ant-design/x/es/sender';
import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

const EMOJI = ['😀', '😁', '😂', '😊', '😍', '👍', '🔥', '❤️', '🙏', '🎉'];
const MESSAGE_LIMIT = 4096;
const UNAVAILABLE_FEATURE_TOOLTIP = 'Пока недоступно';

export interface ChatComposerPropsInterface {
  phone: string;
  replyQuote?: MessageQuoteInterface | null;
  onReplyClear?: () => void;
  onOutgoingQueued?: (clientId: string) => void;
}

export const ChatComposer = ({
  phone,
  replyQuote = null,
  onReplyClear,
  onOutgoingQueued,
}: ChatComposerPropsInterface) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState('');
  const lastSubmitAtRef = useRef(0);
  const senderRef = useRef<SenderRef>(null);

  useEffect(() => {
    if (phone === '') {
      return;
    }

    const frame = requestAnimationFrame(() => {
      senderRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [phone]);

  useEffect(() => {
    if (replyQuote === null) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      senderRef.current?.focus({ preventScroll: true });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [replyQuote]);

  useEffect(() => {
    if (replyQuote === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onReplyClear?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onReplyClear, replyQuote]);

  const appendEmoji = (emoji: string) => {
    setDraft(current => {
      if (current.length >= MESSAGE_LIMIT) {
        return current;
      }
      return `${current}${emoji}`.slice(0, MESSAGE_LIMIT);
    });
  };

  const onSubmit = (message: string) => {
    const text = message.trim();
    const now = Date.now();
    if (text === '' || phone === '' || now - lastSubmitAtRef.current < 400) {
      return;
    }

    lastSubmitAtRef.current = now;
    const clientId = crypto.randomUUID();
    dispatch(sendChatMessage({
      phone,
      text,
      clientId,
      quotedMessageId: replyQuote?.idMessage,
      quote: replyQuote ?? undefined,
    }));
    onOutgoingQueued?.(clientId);
    onReplyClear?.();
    setDraft('');
  };

  const mobileSenderStyles = isMobile
    ? {
      root: {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
      content: {
        background: 'transparent',
      },
    }
    : undefined;

  return (
    <div className={classNames('composer', { 'composer--glass': isMobile })}>
      {replyQuote !== null && (
        <div className="composer__reply">
          <MessageQuoteBlock quote={replyQuote} className="composer__reply-quote" />
          <button
            type="button"
            className="composer__reply-close"
            aria-label="Отменить ответ"
            onClick={() => {
              onReplyClear?.();
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      )}
      <div className="composer__dock">
        <Sender
          ref={senderRef}
          className="composer__sender"
          styles={mobileSenderStyles}
          value={draft}
          placeholder="Сообщение"
          autoSize={{ minRows: 1, maxRows: 6 }}
          submitType="enter"
          onChange={value => {
            setDraft(value.slice(0, MESSAGE_LIMIT));
          }}
          onSubmit={onSubmit}
          prefix={(
            <span className="composer__tools">
              <Popover
                trigger={isMobile ? 'click' : 'hover'}
                placement={isMobile ? 'top' : 'topLeft'}
                mouseEnterDelay={isMobile ? 0 : 0.12}
                mouseLeaveDelay={isMobile ? 0 : 0.15}
                content={(
                  <span className="composer__emoji">
                    {EMOJI.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="composer__emoji-item"
                        onClick={() => {
                          appendEmoji(emoji);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </span>
                )}
              >
                <button type="button" className="composer__icon" aria-label="Эмодзи">
                  <SmileOutlined />
                </button>
              </Popover>
              <Tooltip title={UNAVAILABLE_FEATURE_TOOLTIP}>
                <span className="composer__tool-wrap">
                  <button
                    type="button"
                    className="composer__icon"
                    disabled
                    aria-label="Прикрепить файл (недоступно)"
                  >
                    <PaperClipOutlined />
                  </button>
                </span>
              </Tooltip>
            </span>
          )}
          suffix={(_node, info) => {
            if (draft.trim() === '') {
              return (
                <Tooltip title={UNAVAILABLE_FEATURE_TOOLTIP}>
                  <span className="composer__tool-wrap">
                    <button
                      type="button"
                      className="composer__mic"
                      disabled
                      aria-label="Голосовое сообщение (недоступно)"
                    >
                      <AudioOutlined />
                    </button>
                  </span>
                </Tooltip>
              );
            }

            return (
              <info.components.SendButton
                className="composer__send"
                icon={<TelegramSendIcon />}
              />
            );
          }}
        />
      </div>
    </div>
  );
};
