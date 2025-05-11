import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChat, addMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import MessageList from './MessageList';
import BidInChat from '../bids/BidInChat';

const ChatDetail = () => {
  const { id } = useParams();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);
  const { user } = useAuth();
  const { socket, joinRoom, sendMessage } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await getChat(id);
        setChat(res.data);
        setLoading(false);
        
        // Join socket room for this chat
        joinRoom(id);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch chat details');
        setLoading(false);
      }
    };

    fetchChat();
  }, [id, joinRoom]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (data.roomId === id) {
        // Update chat with new message
        setChat(prevChat => {
          if (!prevChat) return null;
          
          return {
            ...prevChat,
            messages: [
              ...prevChat.messages,
              {
                sender: data.sender,
                content: data.content,
                timestamp: new Date(),
                isBid: data.isBid || false,
                bidAmount: data.bidAmount || null
              }
            ]
          };
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setSending(true);
    
    try {
      const messageData = {
        content: message
      };
      
      const res = await addMessage(id, messageData);
      
      // Send message via socket
      sendMessage({
        roomId: id,
        content: message,
        sender: user.id
      });
      
      // Clear input
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const toggleBidForm = () => {
    setShowBidForm(!showBidForm);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

  if (error && !chat) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        <p>{error}</p>
        <Link to="/chats" className="text-red-700 font-medium hover:underline mt-2 inline-block">
          Back to Chats
        </Link>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Chat not found.</p>
        <Link to="/chats" className="btn btn-primary mt-4 inline-block">
          Back to Chats
        </Link>
      </div>
    );
  }

  const otherUser = user.role === 'student' ? chat.teacher : chat.student;
  const isTeacher = user.role === 'teacher';
  const canBid = isTeacher && chat.assignment.status === 'pending';

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{otherUser.name}</h2>
            <p className="text-sm text-gray-500">
              Assignment: {chat.assignment.title}
            </p>
          </div>
          <div className="flex items-center">
            <Link
              to={`/assignments/${chat.assignment._id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Assignment
            </Link>
            
            {canBid && (
              <button
                onClick={toggleBidForm}
                className="ml-4 btn btn-primary text-sm"
              >
                {showBidForm ? 'Cancel Bid' : 'Place Bid'}
              </button>
            )}
          </div>
        </div>
        
        {showBidForm && (
          <BidInChat 
            assignmentId={chat.assignment._id} 
            chatId={chat._id} 
            onCancel={toggleBidForm} 
          />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <MessageList messages={chat.messages} currentUserId={user.id} />
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input flex-1 mr-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="btn btn-primary"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDetail;
