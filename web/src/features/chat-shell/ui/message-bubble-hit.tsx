import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { useMessageContextMenu } from '@web/features/chat-shell/hooks/use-message-context-menu';
import { useMessageSwipeReply } from '@web/features/chat-shell/hooks/use-message-swipe-reply';
import { useIsMobile } from '@web/shared/lib/use-is-mobile';

import type { ChatMessageInterface } from '@web/entities/chat/model/chats-slice';

export interface MessageBubbleHitPropsInterface {
  message: ChatMessageInterface;
  onOpenMenu: (message: ChatMessageInterface, clientX: number, clientY: number) => void;
  onReply: (message: ChatMessageInterface) => void;
  children: ReactNode;
}

const getBubbleSurface = (node: HTMLDivElement | null): HTMLElement | null => {
  if (node === null) {
    return null;
  }

  const content = node.closest('.ant-bubble-content');
  return content instanceof HTMLElement ? content : null;
};

export const MessageBubbleHit = ({
  message,
  onOpenMenu,
  onReply,
  children,
}: MessageBubbleHitPropsInterface) => {
  const isMobile = useIsMobile();
  const canReply = message.idMessage !== '';
  const hitRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback((clientX: number, clientY: number) => {
    onOpenMenu(message, clientX, clientY);
  }, [message, onOpenMenu]);

  const reply = useCallback(() => {
    onReply(message);
  }, [message, onReply]);

  const { onContextMenu } = useMessageContextMenu(openMenu, canReply && !isMobile);
  const swipe = useMessageSwipeReply(reply, canReply && isMobile);

  useLayoutEffect(() => {
    const surface = getBubbleSurface(hitRef.current);
    if (surface === null) {
      return;
    }

    if (swipe.offsetX === 0) {
      surface.style.transition = 'transform 0.2s ease';
      surface.style.transform = '';
      return;
    }

    surface.style.transition = 'none';
    surface.style.transform = `translate3d(${swipe.offsetX}px, 0, 0)`;
  }, [swipe.offsetX]);

  useEffect(() => {
    const surface = getBubbleSurface(hitRef.current);
    if (surface === null) {
      return;
    }

    return () => {
      surface.style.transform = '';
      surface.style.transition = '';
    };
  }, []);

  return (
    <div
      ref={hitRef}
      className="bubble-hit"
      onContextMenu={onContextMenu}
      {...swipe.handlers}
    >
      <div className="bubble-hit__content">
        {children}
      </div>
    </div>
  );
};
