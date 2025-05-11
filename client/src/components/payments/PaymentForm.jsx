import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '../../services/paymentService';
import { useSocket } from '../../context/SocketContext';

const PaymentForm = ({ assignmentId, amount, teacherId }) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'credit_card',
    transactionId: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendStatusUpdate } = useSocket();

  const { paymentMethod, transactionId } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const paymentData = {
        assignmentId,
        paymentMethod,
        transactionId
      };

      await createPayment(paymentData);
      
      // Notify via socket
      sendStatusUpdate({
        assignmentId,
        status: 'delivered',
        isPaid: true
      });
      
      navigate(`/assignments/${assignmentId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-700 mb-6">
        <p>
          <strong>Note:</strong> This is a demo payment form. In a real application, you would integrate with a payment gateway like Stripe or PayPal.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Amount to Pay</p>
        <p className="text-xl font-bold text-primary-600">${amount}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <div className="mt-1">
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
            Transaction ID (Auto-generated)
          </label>
          <div className="mt-1">
            <input
              id="transactionId"
              name="transactionId"
              type="text"
              value={transactionId}
              onChange={handleChange}
              className="input bg-gray-100"
              readOnly
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This is automatically generated for demo purposes.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Processing...' : `Pay $${amount}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
