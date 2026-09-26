import { useCallback, type MouseEvent } from 'react';

export const useMessageContextMenu = (
  onActivate: (clientX: number, clientY: number) => void,
  enabled = true,
) => {
  const onContextMenu = useCallback((event: MouseEvent) => {
    if (!enabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onActivate(event.clientX, event.clientY);
  }, [enabled, onActivate]);

  return { onContextMenu };
};
