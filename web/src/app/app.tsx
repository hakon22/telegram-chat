import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { BootScreen } from '@web/app/boot-screen';
import { AppRouter } from '@web/app/router';
import { useAppSelector } from '@web/store/hooks';

export const AppRoot = () => {
  const booting = useAppSelector(state => state.connection.booting);
  const sessionStatus = useAppSelector(state => state.session.status);

  if (booting || sessionStatus === SessionStatusEnum.LOADING) {
    return <BootScreen />;
  }

  return <AppRouter />;
};
