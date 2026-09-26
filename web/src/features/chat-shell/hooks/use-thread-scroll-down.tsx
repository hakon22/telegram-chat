import { DownOutlined } from '@ant-design/icons';
import { isNil } from 'lodash-es';
import { useEffect, useRef, useState, type ReactNode, type RefObject, type UIEvent } from 'react';

import { MessageDirectionEnum } from '@shared/enums/message-direction.enum';

import { countUnreadIncoming } from '@web/entities/chat/model/chat-unread';
import { chatEnsureFirstUnread, chatMarkedRead, type ChatInterface } from '@web/entities/chat/model/chats-slice';
import { useAppDispatch } from '@web/store/hooks';

import type { BubbleListRef } from '@ant-design/x/es/bubble/interface';

const AT_BOTTOM_THRESHOLD_PX = 32;

const isScrollAtBottom = (element: HTMLDivElement): boolean => {
  const reverse = getComputedStyle(element).flexDirection === 'column-reverse';

  if (reverse) {
    return Math.abs(element.scrollTop) <= AT_BOTTOM_THRESHOLD_PX;
  }

  return element.scrollTop + element.clientHeight >= element.scrollHeight - AT_BOTTOM_THRESHOLD_PX;
};

export interface UseThreadScrollDownResultInterface {
  onListScroll: (event: UIEvent<HTMLDivElement>) => void;
  jumpButton: ReactNode;
}

export const useThreadScrollDown = (
  chat: ChatInterface,
  listRef: RefObject<BubbleListRef | null>,
): UseThreadScrollDownResultInterface => {
  const dispatch = useAppDispatch();
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true);
  const messageCountRef = useRef(chat.messages.length);

  useEffect(() => {
    messageCountRef.current = chat.messages.length;
    atBottomRef.current = true;
    setAtBottom(true);
  }, [chat.phone]);

  useEffect(() => {
    const previousCount = messageCountRef.current;
    const nextCount = chat.messages.length;

    if (nextCount <= previousCount) {
      messageCountRef.current = nextCount;
      return;
    }

    const added = chat.messages.slice(previousCount);
    messageCountRef.current = nextCount;

    if (atBottomRef.current) {
      dispatch(chatMarkedRead(chat.phone));
      return;
    }

    const firstIncoming = added.find(({ direction }) => direction === MessageDirectionEnum.INCOMING);
    if (!isNil(firstIncoming)) {
      dispatch(chatEnsureFirstUnread({
        phone: chat.phone,
        clientId: firstIncoming.clientId,
      }));
    }
  }, [chat.messages, chat.phone, dispatch]);

  const onListScroll = (event: UIEvent<HTMLDivElement>): void => {
    const nextAtBottom = isScrollAtBottom(event.currentTarget);
    atBottomRef.current = nextAtBottom;
    setAtBottom(nextAtBottom);

    if (nextAtBottom && chat.firstUnreadClientId !== '') {
      dispatch(chatMarkedRead(chat.phone));
    }
  };

  const scrollToLatest = (): void => {
    listRef.current?.scrollTo({
      top: 'bottom',
      behavior: 'smooth',
    });
    dispatch(chatMarkedRead(chat.phone));
    atBottomRef.current = true;
    setAtBottom(true);
  };

  const scrollUnread = countUnreadIncoming(chat);
  const showJump = scrollUnread > 0 && !atBottom;

  const jumpButton = !showJump
    ? null
    : (
      <div className="thread__jump">
        <button
          type="button"
          className="thread__jump-btn"
          aria-label={
            scrollUnread === 1
              ? '1 новое сообщение, прокрутить вниз'
              : `${scrollUnread} новых сообщений, прокрутить вниз`
          }
          onClick={scrollToLatest}
        >
          <DownOutlined />
          <span className="thread__jump-badge" aria-hidden="true">
            {scrollUnread > 99 ? '99+' : scrollUnread}
          </span>
        </button>
      </div>
    );

  return { onListScroll, jumpButton };
};
