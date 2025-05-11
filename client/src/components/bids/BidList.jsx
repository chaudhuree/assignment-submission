import { useState, useEffect } from 'react';
import { acceptBid } from '../../services/bidService';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const BidList = ({ bids, assignmentId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendStatusUpdate } = useSocket();

  const handleAcceptBid = async (bidId, teacherId, bidAmount, teacherName) => {
    if (window.confirm('Are you sure you want to accept this bid? This will assign the teacher to your assignment.')) {
      setLoading(true);
      setError('');
      
      try {
        await acceptBid(bidId);
        
        // Get all teacher IDs who bid on this assignment (for rejection notifications)
        const previousBidders = bids
          .filter(bid => bid.teacher._id !== teacherId && bid.status === 'pending')
          .map(bid => bid.teacher._id);
        
        // Notify via socket
        sendStatusUpdate({
          assignmentId,
          status: 'assigned',
          teacherId,
          teacherName,
          bidAmount,
          previousBidders
        });
        
        toast.success(`Bid accepted! ${teacherName} has been assigned to this assignment.`);
        
        // Reload the page to show updated status after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to accept bid. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (bids.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No bids yet.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {bids.map((bid) => (
          <div 
            key={bid._id} 
            className={`border rounded-lg p-4 ${
              bid.status === 'accepted' 
                ? 'border-green-500 bg-green-50' 
                : bid.status === 'rejected'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{bid.teacher.name}</h4>
                <p className="text-sm text-gray-500">
                  Bid: <span className="font-medium text-primary-600">${bid.amount}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(bid.createdAt)}
                </p>
              </div>
              
              {bid.status === 'pending' && (
                <button
                  onClick={() => handleAcceptBid(bid._id, bid.teacher._id, bid.amount, bid.teacher.name)}
                  disabled={loading}
                  className="btn btn-primary text-sm"
                >
                  {loading ? 'Accepting...' : 'Accept Bid'}
                </button>
              )}
              
              {bid.status === 'accepted' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Accepted
                </span>
              )}
              
              {bid.status === 'rejected' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Rejected
                </span>
              )}
            </div>
            
            {bid.message && (
              <div className="mt-2 text-gray-700 text-sm">
                <p>{bid.message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BidList;
