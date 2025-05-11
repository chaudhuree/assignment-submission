// Socket.io instance to be used across the application
let socketIO;

// Initialize socket.io with the HTTP server
const initSocket = (httpServer) => {
  socketIO = require('socket.io')(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    }
  });
  
  return socketIO;
};

// Export the socket.io instance and initialization function
module.exports = {
  getIO: () => socketIO,
  initSocket
};
