import React from 'react';

const MessageList = ({ messages, currentUserId }) => {
  // Format date
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="space-y-6">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="flex justify-center">
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm">
              {new Date(group.date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          {group.messages.map((message, index) => {
            const isCurrentUser = message.sender === currentUserId;
            const isBid = message.isBid;
            
            return (
              <div 
                key={index} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-white border border-gray-200 text-black' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  } ${
                    isBid 
                      ? 'border-2 border-green-500' 
                      : ''
                  }`}
                >
                  {isBid && (
                    <div className="mb-1 font-medium text-green-600">
                      Bid: ${message.bidAmount}
                    </div>
                  )}
                  <p>{message.content}</p>
                  <div 
                    className={`text-xs mt-1 text-right ${
                      isCurrentUser ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
