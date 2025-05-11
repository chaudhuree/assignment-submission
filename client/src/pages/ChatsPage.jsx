import React from 'react';
import ChatList from '../components/chats/ChatList';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChatsPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <ChatList />
    </div>
  );
};

export default ChatsPage;
