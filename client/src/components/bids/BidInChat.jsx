import { useState } from 'react';
import { createBid } from '../../services/bidService';
import { useSocket } from '../../context/SocketContext';

const BidInChat = ({ assignmentId, chatId, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendBidUpdate, sendMessage } = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid bid amount');
      setLoading(false);
      return;
    }

    try {
      const bidData = {
        assignmentId,
        amount: parseFloat(amount),
        message: `I'm bidding $${amount} for your assignment`
      };

      await createBid(bidData);
      
      // Notify via socket for bid update
      sendBidUpdate({
        assignmentId,
        amount: parseFloat(amount)
      });
      
      // Send message via socket
      sendMessage({
        roomId: chatId,
        content: `I'm bidding $${amount} for your assignment`,
        isBid: true,
        bidAmount: parseFloat(amount)
      });
      
      // Close the bid form
      onCancel();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Place a Bid</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Bid Amount ($)
          </label>
          <div className="mt-1">
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="Enter your bid amount"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your bid will be sent as a message in the chat.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : 'Place Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidInChat;
