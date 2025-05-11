const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initSocket } = require('./socket');

// Load environment variables
dotenv.config();

// Import routes (we'll create these files next)
const authRoutes = require('./routes/auth.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const bidRoutes = require('./routes/bid.routes');
const chatRoutes = require('./routes/chat.routes');
const paymentRoutes = require('./routes/payment.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io and make it globally available
const io = initSocket(server);

// Make io available to imported modules
global.io = io;

// Middleware
app.use(cors(
  {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join room (for private chat between teacher and student)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });
  
  // Handle chat messages
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });
  
  // Handle bid updates
  socket.on('new_bid', (data) => {
    io.to(data.assignmentId).emit('bid_update', data);
  });
  
  // Handle assignment status updates
  socket.on('assignment_status_update', (data) => {
    io.to(data.assignmentId).emit('status_update', data);
  });
  
  // Join subject rooms based on teacher subjects
  socket.on('join_subject_rooms', (subjects) => {
    if (Array.isArray(subjects)) {
      subjects.forEach(subject => {
        socket.join(`subject_${subject}`);
        console.log(`User joined subject room: subject_${subject}`);
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
