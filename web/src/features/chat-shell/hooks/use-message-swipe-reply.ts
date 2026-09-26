import { useCallback, useRef, useState, type TouchEvent } from 'react';

const SWIPE_REPLY_THRESHOLD_PX = 64;
const SWIPE_MAX_DRAG_PX = 72;
const SWIPE_VERTICAL_CANCEL_PX = 36;
const SWIPE_RIGHT_IGNORE_PX = 10;

export interface MessageSwipeReplyHandlersInterface {
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchCancel: () => void;
}

export interface MessageSwipeReplyStateInterface {
  handlers: MessageSwipeReplyHandlersInterface;
  offsetX: number;
}

export const useMessageSwipeReply = (onReply: () => void, enabled = true): MessageSwipeReplyStateInterface => {
  const [offsetX, setOffsetX] = useState(0);
  const originRef = useRef({ x: 0, y: 0 });
  const trackingRef = useRef(false);
  const triggeredRef = useRef(false);

  const reset = useCallback(() => {
    trackingRef.current = false;
    setOffsetX(0);
  }, []);

  const onTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) {
      return;
    }

    const touch = event.touches[0];
    if (touch === undefined) {
      return;
    }

    originRef.current = { x: touch.clientX, y: touch.clientY };
    trackingRef.current = true;
    triggeredRef.current = false;
    setOffsetX(0);
  }, [enabled]);

  const onTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled || !trackingRef.current || triggeredRef.current) {
      return;
    }

    const touch = event.touches[0];
    if (touch === undefined) {
      return;
    }

    const dx = touch.clientX - originRef.current.x;
    const dy = touch.clientY - originRef.current.y;

    if (Math.abs(dy) > SWIPE_VERTICAL_CANCEL_PX) {
      reset();
      return;
    }

    if (dx > SWIPE_RIGHT_IGNORE_PX) {
      setOffsetX(0);
      return;
    }

    const nextOffset = Math.max(-SWIPE_MAX_DRAG_PX, dx);
    setOffsetX(nextOffset);

    if (-dx >= SWIPE_REPLY_THRESHOLD_PX) {
      triggeredRef.current = true;
      reset();
      onReply();
    }
  }, [enabled, onReply, reset]);

  const onTouchEnd = useCallback(() => {
    if (!triggeredRef.current) {
      reset();
    } else {
      trackingRef.current = false;
    }
  }, [reset]);

  return {
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel: onTouchEnd,
    },
    offsetX,
  };
};
