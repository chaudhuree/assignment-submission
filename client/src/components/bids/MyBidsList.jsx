import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherBids, deleteBid } from '../../services/bidService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyBidsList = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected'
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch teacher's bids
  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await getTeacherBids();
      setBids(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bids');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  // Listen for real-time bid status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      // Refresh bids when an assignment status changes
      fetchBids();
    };

    socket.on('status_update', handleStatusUpdate);

    return () => {
      socket.off('status_update', handleStatusUpdate);
    };
  }, [socket]);

  // Handle bid deletion
  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Are you sure you want to cancel this bid?')) {
      try {
        await deleteBid(bidId);
        toast.success('Bid cancelled successfully');
        fetchBids(); // Refresh bids after deletion
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel bid');
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading bids...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <p className="text-blue-700">You haven't placed any bids yet.</p>
      </div>
    );
  }

  // Filter bids based on status
  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    
    // Determine bid status
    if (filter === 'pending' && bid.status === 'pending') return true;
    if (filter === 'accepted' && bid.status === 'accepted') return true;
    if (filter === 'rejected' && bid.status === 'rejected') return true;
    
    // If assignment is assigned to another teacher
    if (filter === 'rejected' && 
        bid.status === 'pending' && 
        bid.assignment.status === 'assigned' && 
        bid.assignment.assignedTo && 
        bid.assignment.assignedTo.toString() !== user.id) {
      return true;
    }
    
    return false;
  });

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} />
      
      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          All Bids ({bids.length})
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('accepted')} 
          className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Accepted
        </button>
        <button 
          onClick={() => setFilter('rejected')} 
          className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Rejected
        </button>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBids.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No bids found with the selected filter.
                </td>
              </tr>
            ) : (
              filteredBids.map((bid) => {
                // Determine bid status
                let bidStatus = "Pending";
                let bidStatusClass = "bg-yellow-100 text-yellow-800";
                
                if (bid.status === 'accepted') {
                  bidStatus = "Accepted";
                  bidStatusClass = "bg-green-100 text-green-800";
                } else if (bid.status === 'rejected') {
                  bidStatus = "Rejected";
                  bidStatusClass = "bg-red-100 text-red-800";
                } else if (bid.assignment.status === 'assigned') {
                  // If assignment is assigned but not to this teacher
                  if (bid.assignment.assignedTo && bid.assignment.assignedTo.toString() !== user.id) {
                    bidStatus = "Rejected";
                    bidStatusClass = "bg-red-100 text-red-800";
                  }
                }
                
                return (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/assignments/${bid.assignment._id}`} className="text-blue-600 hover:text-blue-900">
                              {bid.assignment.title}
                            </Link>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {bid.assignment._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bid.assignment.student?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{bid.assignment.student?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bid.assignment.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${bid.amount}</div>
                      {bid.assignment.finalBid && bid.assignment.finalBid !== bid.amount && (
                        <div className="text-xs text-gray-500">Final: ${bid.assignment.finalBid}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bidStatusClass}`}>
                        {bidStatus}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Assignment: <span className={`px-1 py-0.5 rounded ${getStatusBadgeClass(bid.assignment.status)}`}>{bid.assignment.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bid.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/assignments/${bid.assignment._id}`} className="text-indigo-600 hover:text-indigo-900 block mb-2">
                        View Details
                      </Link>
                      {(bidStatus === "Accepted" || bid.assignment.status === 'assigned') && bid.chatId && (
                        <Link to={`/chats/${bid.chatId}`} className="text-green-600 hover:text-green-900 block">
                          Open Chat
                        </Link>
                      )}
                      {bidStatus === "Pending" && (
                        <button 
                          onClick={() => handleDeleteBid(bid._id)}
                          className="text-red-600 hover:text-red-900 block mt-2"
                        >
                          Cancel Bid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBidsList;
