import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment } from '../../services/assignmentService';
import { createBid } from '../../services/bidService';
import { useSocket } from '../../context/SocketContext';

const BidForm = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { sendBidUpdate } = useSocket();

  const { amount, message } = formData;

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getAssignment(id);
        setAssignment(res.data);
        // Set initial amount to the assignment price
        setFormData(prev => ({
          ...prev,
          amount: res.data.price
        }));
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch assignment details');
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.name === 'amount' ? parseFloat(e.target.value) || '' : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const bidData = {
        assignmentId: id,
        amount,
        message
      };

      await createBid(bidData);
      
      // Notify via socket
      sendBidUpdate({
        assignmentId: id,
        amount,
        message
      });
      
      navigate(`/assignments/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        <p>{error}</p>
        <button 
          onClick={() => navigate('/assignments')} 
          className="text-red-700 font-medium hover:underline mt-2"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Place a Bid</h2>
      
      <div className="mb-6 card">
        <h3 className="text-lg font-semibold mb-3">{assignment.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Subject: <span className="font-medium">{assignment.subject}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Budget: <span className="font-medium">${assignment.price}</span>
        </p>
        <p className="text-gray-700">{assignment.description}</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Your Bid</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Bid Amount ($)
            </label>
            <div className="mt-1">
              <input
                id="amount"
                name="amount"
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={handleChange}
                className="input"
                placeholder="Enter your bid amount"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Student's budget: ${assignment.price}
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message to Student
            </label>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                value={message}
                onChange={handleChange}
                className="input"
                placeholder="Explain why you're the best person for this assignment"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/assignments/${id}`)}
              className="btn btn-secondary mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Submitting...' : 'Place Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BidForm;
