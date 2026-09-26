import { Navigate } from 'react-router-dom';

import { SessionStatusEnum } from '@shared/enums/session-status.enum';

import { LoginForm } from '@web/features/login/ui/login-form';
import { useAppSelector } from '@web/store/hooks';

import '@web/styles/login.scss';

export const LoginPage = () => {
  const status = useAppSelector(state => state.session.status);

  if (status === SessionStatusEnum.READY) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <main className="login">
      <section className="login__card">
        <div className="login__logo" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="M8 24 L22 16 L40 24 L22 32 Z" />
            <path d="M22 32 L22 40 L30 34" />
          </svg>
        </div>
        <h1 className="login__title">Telegram</h1>
        <p className="login__hint">Введите данные инстанса GREEN-API</p>
        <LoginForm />
      </section>
    </main>
  );
};
