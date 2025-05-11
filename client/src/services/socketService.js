import { io } from 'socket.io-client';

// Create a socket instance
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  autoConnect: true
});

// Log socket connection status
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Export the socket instance
export default socket;
