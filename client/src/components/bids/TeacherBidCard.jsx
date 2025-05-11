import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherBidForAssignment, updateBid } from '../../services/bidService';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';

const TeacherBidCard = ({ assignmentId, onBidUpdate, showPlaceBidButton = false }) => {
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  // Fetch teacher's bid for this assignment
  useEffect(() => {
    const fetchTeacherBid = async () => {
      try {
        const res = await getTeacherBidForAssignment(assignmentId);
        setBid(res.data);
        setFormData({
          amount: res.data.amount,
          message: res.data.message
        });
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          // No bid found, which is okay
          setLoading(false);
        } else {
          setError(err.response?.data?.message || 'Failed to fetch bid details');
          setLoading(false);
        }
      }
    };

    fetchTeacherBid();
  }, [assignmentId]);

  // Listen for bid updates
  useEffect(() => {
    if (!socket) return;

    const handleBidUpdated = (data) => {
      if (data.assignmentId === assignmentId) {
        // Refresh bid data
        fetchTeacherBid();
      }
    };

    socket.on('bid_updated', handleBidUpdated);

    return () => {
      socket.off('bid_updated', handleBidUpdated);
    };
  }, [socket, assignmentId]);

  const fetchTeacherBid = async () => {
    try {
      const res = await getTeacherBidForAssignment(assignmentId);
      setBid(res.data);
      setFormData({
        amount: res.data.amount,
        message: res.data.message
      });
    } catch (err) {
      console.error('Error fetching bid:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await updateBid(bid._id, formData);
      toast.success('Bid updated successfully');
      setIsEditing(false);
      fetchTeacherBid();
      if (onBidUpdate) {
        onBidUpdate();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!bid) {
    // No bid yet, show place bid button if requested
    return showPlaceBidButton ? (
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Bidding</h3>
        <p className="text-gray-600 mb-4">You haven't placed a bid on this assignment yet.</p>
        <Link
          to={`/assignments/${assignmentId}/bid`}
          className="btn btn-primary w-full block text-center"
        >
          Place Bid
        </Link>
      </div>
    ) : null;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Your Bid</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bid Amount ($)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="3"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Explain why you're the best fit for this assignment..."
            ></textarea>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Updating...' : 'Update Bid'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">Your Bid Amount</p>
              <p className="text-xl font-bold text-primary-600">${bid.amount}</p>
            </div>
            <div className="px-2 py-1 rounded text-xs font-medium capitalize" 
              style={{
                backgroundColor: bid.status === 'pending' ? '#FEF3C7' : 
                                bid.status === 'accepted' ? '#D1FAE5' : '#FEE2E2',
                color: bid.status === 'pending' ? '#92400E' : 
                      bid.status === 'accepted' ? '#065F46' : '#B91C1C'
              }}
            >
              {bid.status}
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-500">Your Message</p>
            <p className="text-gray-700">{bid.message}</p>
          </div>
          
          {bid.status === 'pending' && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Update Bid
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherBidCard;
