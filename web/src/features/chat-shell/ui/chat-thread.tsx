import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble, type BubbleItemType } from '@ant-design/x';
import { Button } from 'antd';
import classNames from 'classnames';
import { isNil } from 'lodash-es';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ConnectionPhaseEnum } from '@shared/enums/connection-phase.enum';
import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';
import { MessageStatusEnum } from '@shared/enums/message-status.enum';

import {
  activeChatSet,
  chatMarkedRead,
  type ChatInterface,
  type ChatMessageInterface,
} from '@web/entities/chat/model/chats-slice';
import { useThreadScrollDown } from '@web/features/chat-shell/hooks/use-thread-scroll-down';
import { ChatComposer } from '@web/features/chat-shell/ui/chat-composer';
import { MessageActionMenu } from '@web/features/chat-shell/ui/message-action-menu';
import { MessageBubbleHit } from '@web/features/chat-shell/ui/message-bubble-hit';
import { sendChatMessage } from '@web/features/send-message/model/send-message-thunk';
import { buildMessageQuote } from '@web/shared/lib/build-message-quote';
import { avatarColor, formatPhone } from '@web/shared/lib/format-phone';
import { dayKey, formatDayLabel } from '@web/shared/lib/format-time';
import { AppSpinner } from '@web/shared/ui/app-spinner';
import { BubbleMessage } from '@web/shared/ui/bubble-message';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

import type { BubbleListRef } from '@ant-design/x/es/bubble/interface';
import type { MessageQuoteInterface } from '@shared/types/message-quote.interface';

export interface ChatThreadPropsInterface {
  onStartChat: () => void;
  showMobileBack?: boolean;
}

interface MessageMenuStateInterface {
  message: ChatMessageInterface;
  x: number;
  y: number;
}

const buildRows = (
  chat: ChatInterface,
  retryMessage: (message: ChatMessageInterface) => void,
  openMessageMenu: (message: ChatMessageInterface, clientX: number, clientY: number) => void,
  onReply: (message: ChatMessageInterface) => void,
): BubbleItemType[] => {
  const rows: BubbleItemType[] = [];

  chat.messages.forEach((message, index) => {
    const previous = chat.messages[index - 1];
    if (isNil(previous) || dayKey(previous.createdAt) !== dayKey(message.createdAt)) {
      rows.push({
        key: `day-${dayKey(message.createdAt)}-${message.clientId}`,
        role: 'divider',
        content: formatDayLabel(message.createdAt),
        className: 'thread__date',
      });
    }

    if (chat.firstUnreadClientId !== '' && message.clientId === chat.firstUnreadClientId) {
      rows.push({
        key: `unread-${message.clientId}`,
        role: 'divider',
        content: 'Непрочитанные сообщения',
        className: 'thread__unread',
      });
    }

    const next = chat.messages[index + 1];
    const outgoing = message.direction === MessageDirectionEnum.OUTGOING;
    const tail = isNil(next)
      || next.direction !== message.direction
      || dayKey(next.createdAt) !== dayKey(message.createdAt);
    const hasQuote = message.quote !== undefined;

    rows.push({
      key: message.clientId,
      role: outgoing ? 'user' : 'ai',
      content: (
        <MessageBubbleHit
          message={message}
          onOpenMenu={openMessageMenu}
          onReply={onReply}
        >
          <BubbleMessage message={message} />
        </MessageBubbleHit>
      ),
      classNames: {
        root: classNames('bubble', {
          bubble_tail: tail,
          'bubble_has-quote': hasQuote,
        }),
        content: 'bubble__content',
      },
      onClick: () => {
        retryMessage(message);
      },
    });
  });

  return rows;
};

interface ChatThreadActivePropsInterface {
  chat: ChatInterface;
  showMobileBack: boolean;
  bannerMessage: string;
  updating: boolean;
}

const ChatThreadActive = ({
  chat,
  showMobileBack,
  bannerMessage,
  updating,
}: ChatThreadActivePropsInterface) => {
  const dispatch = useAppDispatch();
  const listRef = useRef<BubbleListRef>(null);
  const pendingScrollClientIdRef = useRef<string | null>(null);
  const [messageMenu, setMessageMenu] = useState<MessageMenuStateInterface | null>(null);
  const [replyQuote, setReplyQuote] = useState<MessageQuoteInterface | null>(null);
  const { onListScroll, jumpButton } = useThreadScrollDown(chat, listRef);

  useEffect(() => {
    setMessageMenu(null);
    setReplyQuote(null);
  }, [chat.phone]);

  const queueScrollToOutgoing = useCallback((clientId: string) => {
    pendingScrollClientIdRef.current = clientId;
    dispatch(chatMarkedRead(chat.phone));
  }, [chat.phone, dispatch]);

  useEffect(() => {
    const clientId = pendingScrollClientIdRef.current;
    if (clientId === null) {
      return;
    }

    const hasMessage = chat.messages.some(message => message.clientId === clientId);
    if (!hasMessage) {
      return;
    }

    pendingScrollClientIdRef.current = null;

    const scrollToOutgoing = (): void => {
      listRef.current?.scrollTo({
        key: clientId,
        behavior: 'smooth',
        block: 'end',
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToOutgoing);
    });
  }, [chat.messages]);

  const retryMessage = (message: ChatMessageInterface) => {
    if (message.direction !== MessageDirectionEnum.OUTGOING) {
      return;
    }

    const failed = message.status === MessageStatusEnum.FAILED
      || message.status === MessageStatusEnum.NO_ACCOUNT;
    if (!failed) {
      return;
    }

    dispatch(sendChatMessage({
      phone: chat.phone,
      text: message.text,
      clientId: message.clientId,
      quotedMessageId: message.quote?.idMessage,
      quote: message.quote,
    }));
    queueScrollToOutgoing(message.clientId);
  };

  const openMessageMenu = useCallback((message: ChatMessageInterface, clientX: number, clientY: number) => {
    setMessageMenu({ message, x: clientX, y: clientY });
  }, []);

  const startReply = useCallback((message: ChatMessageInterface) => {
    const quote = buildMessageQuote(message, chat.phone);
    if (quote === null) {
      return;
    }

    setReplyQuote(quote);
  }, [chat.phone]);

  const rows = buildRows(chat, retryMessage, openMessageMenu, startReply);
  const title = formatPhone(chat.phone);

  return (
    <section className={classNames('thread', { 'thread--glass-bar': showMobileBack })}>
      <header className="thread__header">
        {showMobileBack && (
          <button
            type="button"
            className="thread__back"
            aria-label="К списку чатов"
            onClick={() => {
              dispatch(activeChatSet(''));
            }}
          >
            <ArrowLeftOutlined />
          </button>
        )}
        <span className="thread__avatar" style={{ background: avatarColor(chat.phone) }}>
          <UserOutlined />
        </span>
        <span className="thread__titles">
          <span className="thread__name">{title}</span>
          <span className="thread__subtitle">
            {updating && (
              <span className="thread__updating">
                <AppSpinner size="meta" />
                Обновление…
              </span>
            )}
            {updating ? '' : title}
          </span>
        </span>
      </header>
      {bannerMessage !== '' && (
        <div className="thread__banner" role="alert">{bannerMessage}</div>
      )}
      <div className="thread__list">
        <Bubble.List
          ref={listRef}
          key={chat.phone}
          className="thread__bubbles"
          autoScroll
          items={rows}
          onScroll={onListScroll}
          role={{
            user: {
              placement: 'end',
              variant: 'shadow',
              shape: 'default',
              styles: {
                content: {
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: 'max-content',
                  maxWidth: 420,
                  minHeight: 0,
                  flexShrink: 0,
                  lineHeight: 1,
                },
              },
            },
            ai: {
              placement: 'start',
              variant: 'shadow',
              shape: 'default',
              styles: {
                content: {
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: 'max-content',
                  maxWidth: 420,
                  minHeight: 0,
                  flexShrink: 0,
                  lineHeight: 1,
                },
              },
            },
          }}
        />
        {jumpButton}
      </div>
      {messageMenu !== null && (
        <MessageActionMenu
          message={messageMenu.message}
          x={messageMenu.x}
          y={messageMenu.y}
          onReply={startReply}
          onClose={() => {
            setMessageMenu(null);
          }}
        />
      )}
      <ChatComposer
        phone={chat.phone}
        replyQuote={replyQuote}
        onReplyClear={() => {
          setReplyQuote(null);
        }}
        onOutgoingQueued={queueScrollToOutgoing}
      />
    </section>
  );
};

export const ChatThread = ({ onStartChat, showMobileBack = false }: ChatThreadPropsInterface) => {
  const chats = useAppSelector(state => state.chats.items);
  const activePhone = useAppSelector(state => state.chats.activePhone);
  const chat = useAppSelector(state => state.chats.items.find(item => item.phone === activePhone));
  const phase = useAppSelector(state => state.connection.phase);
  const bannerMessage = useAppSelector(state => state.connection.bannerMessage);
  const updating = phase === ConnectionPhaseEnum.BACKOFF;

  if (isNil(chat)) {
    return (
      <section className="thread thread_empty">
        {bannerMessage !== '' && (
          <div className="thread__banner" role="alert">{bannerMessage}</div>
        )}
        <div className="thread__placeholder">
          {chats.length === 0 ? (
            <>
              <h2>Чатов нет</h2>
              <Button type="primary" onClick={onStartChat}>
                Начать общение
              </Button>
            </>
          ) : (
            <h2>Выберите чат, чтобы начать общение</h2>
          )}
        </div>
      </section>
    );
  }

  return (
    <ChatThreadActive
      chat={chat}
      showMobileBack={showMobileBack}
      bannerMessage={bannerMessage}
      updating={updating}
    />
  );
};
