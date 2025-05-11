import React from 'react';
import ChatDetail from '../components/chats/ChatDetail';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChatDetailPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <ChatDetail />
    </div>
  );
};

export default ChatDetailPage;
