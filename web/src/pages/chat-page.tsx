import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { ChatShell } from '@web/features/chat-shell/ui/chat-shell';
import { startPoller, stopPoller } from '@web/features/poller/model/poller-thunk';
import { AppSpinner } from '@web/shared/ui/app-spinner';
import { useAppDispatch, useAppSelector } from '@web/store/hooks';

export const ChatPage = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => state.session.status);

  useEffect(() => {
    if (status !== SessionStatusEnum.READY) {
      return;
    }

    dispatch(startPoller());

    return () => {
      dispatch(stopPoller());
    };
  }, [dispatch, status]);

  if (status === SessionStatusEnum.LOADING) {
    return (
      <div className="boot">
        <AppSpinner size="page" />
      </div>
    );
  }

  if (status !== SessionStatusEnum.READY) {
    return <Navigate to="/" replace />;
  }

  return <ChatShell />;
};
