import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        token
      }
    });

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  // Join a room (for private chat)
  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('join_room', roomId);
    }
  };

  // Send a message
  const sendMessage = (data) => {
    if (socket && connected) {
      socket.emit('send_message', data);
    }
  };

  // Send a bid update
  const sendBidUpdate = (data) => {
    if (socket && connected) {
      socket.emit('new_bid', data);
    }
  };

  // Send assignment status update
  const sendStatusUpdate = (data) => {
    if (socket && connected) {
      socket.emit('assignment_status_update', data);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinRoom,
        sendMessage,
        sendBidUpdate,
        sendStatusUpdate
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
