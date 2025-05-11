# Assignment Bidding Platform

A platform for students to submit assignments and teachers to bid on them. This application includes real-time communication using Socket.io for bidding, chatting, and status updates.

## Features

- **Three User Roles**: Super Admin, Teacher, and Student
- **Assignment Submission**: Students can submit assignments with subject, description, title, and price
- **Bidding System**: Teachers can bid on assignments in their subjects
- **Real-time Chat**: Communication between teachers and students
- **Payment System**: Students pay to download completed assignments
- **Preview System**: Students can preview assignments before payment

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer

## Project Structure

```
assignment-bidding-platform/
├── models/             # Database models
│   ├── user.model.js
│   ├── assignment.model.js
│   ├── bid.model.js
│   ├── chat.model.js
│   └── payment.model.js
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── assignment.routes.js
│   ├── bid.routes.js
│   ├── chat.routes.js
│   └── payment.routes.js
├── middleware/         # Middleware functions
│   └── auth.middleware.js
├── uploads/            # Directory for file uploads
├── .env                # Environment variables
├── package.json        # Project dependencies
└── server.js           # Main application file
```

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/assignment-bidding
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. **Start the server**
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (super_admin only)
- `GET /api/auth/teachers` - Get all teachers
- `PUT /api/auth/users/:id` - Update user (super_admin only)
- `DELETE /api/auth/users/:id` - Delete user (super_admin only)

### Assignments
- `POST /api/assignments` - Create a new assignment (student only)
- `GET /api/assignments` - Get all assignments (filtered by role)
- `GET /api/assignments/:id` - Get single assignment
- `PUT /api/assignments/:id/complete` - Complete assignment (teacher only)
- `PUT /api/assignments/:id/accept-bid` - Accept bid (student only)
- `PUT /api/assignments/:id/delivered` - Mark as delivered (student only)
- `DELETE /api/assignments/:id` - Delete assignment (student or super_admin)
- `GET /api/assignments/:id/preview` - Get preview file
- `GET /api/assignments/:id/download` - Download full file (paid students only)

### Bids
- `POST /api/bids` - Create a new bid (teacher only)
- `GET /api/bids/assignment/:assignmentId` - Get all bids for an assignment
- `GET /api/bids/teacher` - Get all bids by a teacher
- `PUT /api/bids/:id/accept` - Accept a bid (student only)
- `DELETE /api/bids/:id` - Delete a bid (teacher only)

### Chats
- `GET /api/chats` - Get all chats for current user
- `GET /api/chats/:id` - Get single chat
- `POST /api/chats` - Create a new chat
- `POST /api/chats/:id/messages` - Add message to chat
- `GET /api/chats/assignment/:assignmentId/teacher/:teacherId` - Get chat by assignment and teacher

### Payments
- `POST /api/payments` - Create a new payment (student only)
- `GET /api/payments` - Get all payments for current user
- `GET /api/payments/:id` - Get single payment
- `GET /api/payments/assignment/:assignmentId` - Get payments for an assignment

## Real-time Communication with Socket.IO

This application uses Socket.IO for real-time bidding, chatting, and status updates. Below is a detailed explanation of how the Socket.IO implementation works.

### Socket.IO Architecture

#### Server-Side Implementation

1. **Socket.IO Initialization**
   - The Socket.IO server is initialized in `socket.js` as a module that can be imported by other files
   - The server is configured with CORS settings to allow connections from the client (http://localhost:5173)
   - The Socket.IO instance is made globally available in `server.js` for use across the application

   ```javascript
   // socket.js
   let socketIO;

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

   module.exports = {
     getIO: () => socketIO,
     initSocket
   };
   ```

2. **Connection Handling**
   - Socket.IO connections are established in `server.js`
   - When a client connects, the server logs the connection and sets up event listeners
   - The server handles various events like joining rooms, sending messages, and updating assignment status

   ```javascript
   // server.js
   io.on('connection', (socket) => {
     console.log('New client connected:', socket.id);
     
     // Event handlers for various socket events
     socket.on('join_room', (roomId) => { /* ... */ });
     socket.on('send_message', (data) => { /* ... */ });
     socket.on('new_bid', (data) => { /* ... */ });
     socket.on('assignment_status_update', (data) => { /* ... */ });
     socket.on('join_subject_rooms', (subjects) => { /* ... */ });
     socket.on('disconnect', () => { /* ... */ });
   });
   ```

#### Client-Side Implementation

1. **Socket Context Provider**
   - The client uses a React Context Provider (`SocketContext.jsx`) to manage Socket.IO connections
   - The provider initializes the connection when a user is authenticated and provides methods for interacting with the socket

   ```javascript
   // SocketContext.jsx
   export const SocketProvider = ({ children }) => {
     const [socket, setSocket] = useState(null);
     const [connected, setConnected] = useState(false);
     const { token, isAuthenticated } = useAuth();

     useEffect(() => {
       if (!isAuthenticated || !token) {
         // Disconnect if not authenticated
         return;
       }

       // Initialize socket connection with auth token
       const newSocket = io('http://localhost:5000', {
         auth: { token }
       });

       // Set up event listeners
       newSocket.on('connect', () => { /* ... */ });
       newSocket.on('disconnect', () => { /* ... */ });
       newSocket.on('error', (error) => { /* ... */ });

       setSocket(newSocket);

       // Cleanup on unmount
       return () => {
         if (newSocket) newSocket.disconnect();
       };
     }, [isAuthenticated, token]);

     // Methods for interacting with the socket
     const joinRoom = (roomId) => { /* ... */ };
     const sendMessage = (data) => { /* ... */ };
     const sendBidUpdate = (data) => { /* ... */ };
     const sendStatusUpdate = (data) => { /* ... */ };

     return (
       <SocketContext.Provider value={{ socket, connected, joinRoom, sendMessage, sendBidUpdate, sendStatusUpdate }}>
         {children}
       </SocketContext.Provider>
     );
   };
   ```

### Room-Based Communication

The application uses Socket.IO rooms for targeted communication:

1. **Chat Rooms**
   - Each chat between a student and teacher has a unique room ID (typically the chat document ID)
   - Users join these rooms to send and receive private messages
   - Example: When viewing a chat, users join the room with `joinRoom(chatId)`

2. **Assignment Rooms**
   - Each assignment has a room identified by its ID
   - Updates about bids and status changes are sent to these rooms
   - Example: When a teacher places a bid, the update is sent to the assignment room

3. **Subject Rooms**
   - Teachers join rooms based on the subjects they teach
   - New assignments are broadcast to relevant subject rooms
   - Example: When a student creates a Math assignment, teachers who teach Math receive notifications

### Socket.IO Events

1. **Connection Events**
   - `connect` - Fired when a client successfully connects to the server
   - `disconnect` - Fired when a client disconnects from the server

2. **Room Management**
   - `join_room` - Client requests to join a specific room (chat or assignment)
   - `join_subject_rooms` - Teacher joins rooms for subjects they teach

3. **Chat Events**
   - `send_message` - Client sends a message to a specific room
   - `receive_message` - Server broadcasts a message to all clients in a room

4. **Bidding Events**
   - `new_bid` - Teacher places a new bid on an assignment
   - `bid_update` - Server notifies clients about a new bid

5. **Assignment Events**
   - `new_assignment` - Student creates a new assignment
   - `assignment_status_update` - Assignment status changes (e.g., assigned, completed)
   - `status_update` - Server notifies clients about status changes

### Real-Time Notification Flow

1. **New Assignment Notification**
   - Student creates an assignment through the API
   - Server emits a `new_assignment` event to teachers who teach the relevant subject
   - Teachers receive a notification about the new assignment

2. **Bidding Notification**
   - Teacher places a bid through the API
   - Server emits a `new_bid` event to the assignment room
   - Student receives a toast notification about the new bid

3. **Bid Acceptance Notification**
   - Student accepts a bid through the API
   - Server emits a `status_update` event to the assignment room
   - The winning teacher receives a success notification
   - Other teachers who bid receive a notification that the assignment was assigned to someone else

4. **Chat Message Notification**
   - User sends a message through the chat interface
   - Client emits a `send_message` event to the server
   - Server broadcasts a `receive_message` event to all clients in the chat room
   - Recipients see the new message in real-time

5. **Assignment Completion Notification**
   - Teacher marks an assignment as complete through the API
   - Server emits a `status_update` event to the assignment room
   - Student receives a notification that the assignment is ready for review

### Code Examples

#### Sending a Chat Message

```javascript
// Client-side (ChatDetail.jsx)
const handleSendMessage = async () => {
  try {
    // Send message to server via API
    const response = await addMessage(id, { content: message });
    
    // Emit socket event for real-time update
    sendMessage({
      roomId: id,
      message: response.data.message
    });
    
    setMessage('');
  } catch (err) {
    setError('Failed to send message');
  }
};
```

#### Placing a Bid

```javascript
// Client-side (BidForm.jsx)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Send bid to server via API
    const response = await createBid({
      assignment: assignmentId,
      amount: bidAmount
    });
    
    // Emit socket event for real-time notification
    sendBidUpdate({
      assignmentId,
      bidId: response.data.data._id,
      teacherId: user.id,
      teacherName: user.name,
      bidAmount
    });
    
    navigate(`/assignments/${assignmentId}`);
  } catch (err) {
    setError('Failed to place bid');
  }
};
```

#### Accepting a Bid

```javascript
// Client-side (BidList.jsx)
const handleAcceptBid = async (bidId, teacherId, bidAmount) => {
  try {
    // Accept bid via API
    await acceptBid(assignmentId, { teacherId, bidAmount });
    
    // Emit socket event for real-time notification
    sendStatusUpdate({
      assignmentId,
      status: 'assigned',
      teacherId
    });
    
    window.location.reload();
  } catch (err) {
    setError('Failed to accept bid');
  }
};
```

### Debugging Socket.IO

To debug Socket.IO connections and events:

1. **Server-side logs**:
   - Check the console for connection logs (`New client connected: [socket.id]`)
   - Monitor room joining logs (`User joined room: [roomId]`)
   - Look for error messages related to socket events

2. **Client-side logs**:
   - Check the browser console for connection status (`Socket connected`)
   - Monitor event emissions and receptions
   - Use `socket.on('connect', () => console.log('Connected'))` for connection status

3. **Common issues**:
   - CORS errors: Ensure the CORS settings in `socket.js` match your client URL
   - Authentication issues: Verify the token is being sent correctly
   - Room joining failures: Check if room IDs are valid and consistent

## License

ISC
"# assignment-submission" 
