import { useEffect, useLayoutEffect, useRef } from 'react';

import type { ChatMessageInterface } from '@web/entities/chat/model/chats-slice';

export interface MessageActionMenuPropsInterface {
  message: ChatMessageInterface;
  x: number;
  y: number;
  onReply: (message: ChatMessageInterface) => void;
  onClose: () => void;
}

const MENU_WIDTH = 168;
const MENU_HEIGHT = 44;
const VIEWPORT_PADDING = 8;

export const MessageActionMenu = ({
  message,
  x,
  y,
  onReply,
  onClose,
}: MessageActionMenuPropsInterface) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = menuRef.current;
    if (node === null) {
      return;
    }

    const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
    const maxTop = window.innerHeight - MENU_HEIGHT - VIEWPORT_PADDING;
    const left = Math.min(Math.max(VIEWPORT_PADDING, x), maxLeft);
    const top = Math.min(Math.max(VIEWPORT_PADDING, y), maxTop);
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
  }, [x, y]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        className="message-action-menu__backdrop"
        aria-label="Закрыть меню"
        onClick={onClose}
      />
      <div ref={menuRef} className="message-action-menu" role="menu">
        <button
          type="button"
          className="message-action-menu__item"
          role="menuitem"
          onClick={() => {
            onReply(message);
            onClose();
          }}
        >
          Ответить
        </button>
      </div>
    </>
  );
};
