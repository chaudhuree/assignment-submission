import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AssignmentCard = ({ assignment }) => {
  const { user } = useAuth();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {assignment.title}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(assignment.status)}`}>
            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </span>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">
          Subject: <span className="font-medium">{assignment.subject}</span>
        </p>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {assignment.description}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            <span className="font-medium text-primary-600">${assignment.price}</span>
            {assignment.finalBid && assignment.finalBid !== assignment.price && (
              <span className="ml-2 font-medium text-green-600">
                Final: ${assignment.finalBid}
              </span>
            )}
          </div>
          <div>{formatDate(assignment.createdAt)}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <Link
          to={`/assignments/${assignment._id}`}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details
        </Link>
        
        {user && user.role === 'teacher' && assignment.status === 'pending' && (
          <Link
            to={`/assignments/${assignment._id}/bid`}
            className="ml-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Place Bid
          </Link>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
