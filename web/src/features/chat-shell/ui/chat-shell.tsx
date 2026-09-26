import classNames from 'classnames';
import { useState } from 'react';

import { ChatSidebar } from '@web/features/chat-shell/ui/chat-sidebar';
import { ChatThread } from '@web/features/chat-shell/ui/chat-thread';
import { useIsMobile } from '@web/shared/lib/use-is-mobile';
import { useAppSelector } from '@web/store/hooks';

import '@web/styles/shell.scss';

export const ChatShell = () => {
  const [creating, setCreating] = useState(false);
  const isMobile = useIsMobile();
  const activePhone = useAppSelector(state => state.chats.activePhone);
  const hasActiveChat = activePhone !== '';
  const mobileShowThread = isMobile && hasActiveChat && !creating;

  return (
    <div
      className={classNames('shell', {
        'shell--mobile': isMobile,
        'shell--pane-chats': isMobile && !mobileShowThread,
        'shell--pane-thread': mobileShowThread,
      })}
    >
      <ChatSidebar
        creating={creating}
        onCreatingChange={setCreating}
      />
      <ChatThread
        showMobileBack={mobileShowThread}
        onStartChat={() => {
          setCreating(true);
        }}
      />
    </div>
  );
};
