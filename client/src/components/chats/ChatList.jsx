import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChats } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getChats();
        setChats(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch chats');
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the last message from a chat
  const getLastMessage = (chat) => {
    if (chat.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.messages[chat.messages.length - 1];
    const isBid = lastMessage.isBid;
    
    if (isBid) {
      return `Bid: $${lastMessage.bidAmount}`;
    }
    
    return lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading chats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chats found.</p>
        {user.role === 'student' && (
          <p className="text-gray-500 mt-2">
            When teachers bid on your assignments, you'll be able to chat with them here.
          </p>
        )}
        {user.role === 'teacher' && (
          <p className="text-gray-500 mt-2">
            When you bid on assignments, you'll be able to chat with students here.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Your Chats</h2>
      
      <div className="space-y-4">
        {chats.map((chat) => (
          <Link
            key={chat._id}
            to={`/chats/${chat._id}`}
            className="block border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition-colors"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user.role === 'student' ? chat.teacher.name : chat.student.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">
                    Assignment: {chat.assignment.title}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(chat.updatedAt)}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mt-2 line-clamp-1">
                {getLastMessage(chat)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
