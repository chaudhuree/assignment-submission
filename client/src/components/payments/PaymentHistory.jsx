import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPayments } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await getPayments();
        setPayments(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payment history');
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading payment history...</p>
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No payment history found.</p>
        {user.role === 'student' && (
          <p className="text-gray-500 mt-2">
            When you make payments for completed assignments, they will appear here.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {user.role === 'student' ? 'Teacher' : 'Student'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.assignment.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role === 'student' ? payment.teacher.name : payment.student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                  ${payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {payment.paymentMethod.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    to={`/assignments/${payment.assignment._id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View Assignment
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
