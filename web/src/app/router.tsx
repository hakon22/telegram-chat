import { Navigate, Route, Routes } from 'react-router-dom';

import { ChatPage } from '@web/pages/chat-page';
import { LoginPage } from '@web/pages/login-page';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
