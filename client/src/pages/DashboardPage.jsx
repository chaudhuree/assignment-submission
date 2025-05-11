import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../services/assignmentService';
import { getChats } from '../services/chatService';
import { getBidsForAssignment } from '../services/bidService';
import { useAuth } from '../context/AuthContext';
import AssignmentCard from '../components/assignments/AssignmentCard';

const DashboardPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [chats, setChats] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch assignments
        const assignmentsRes = await getAssignments();
        setAssignments(assignmentsRes.data.slice(0, 3)); // Show only 3 most recent

        // Fetch chats
        const chatsRes = await getChats();
        setChats(chatsRes.data.slice(0, 3)); // Show only 3 most recent

        // Fetch bids if user is a student
        if (user.role === 'student' && assignmentsRes.data.length > 0) {
          const firstAssignment = assignmentsRes.data[0];
          const bidsRes = await getBidsForAssignment(firstAssignment._id);
          setBids(bidsRes.data);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
    
    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}!</h2>
        <p className="text-gray-600">
          {user.role === 'student'
            ? 'Submit assignments and find qualified teachers to help you.'
            : user.role === 'teacher'
            ? 'Browse available assignments and place your bids.'
            : 'Manage users, assignments, and platform activities.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Assignments</h3>
          <p className="text-3xl font-bold text-primary-600">{assignments.length}</p>
          <Link to="/assignments" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
            View All Assignments
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Chats</h3>
          <p className="text-3xl font-bold text-primary-600">{chats.length}</p>
          <Link to="/chats" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
            View All Chats
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">
            {user.role === 'student' ? 'Bids Received' : 'Your Bids'}
          </h3>
          <p className="text-3xl font-bold text-primary-600">{bids.length}</p>
          {user.role === 'teacher' && (
            <Link to="/my-bids" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              View All Bids
            </Link>
          )}
        </div>
      </div>

      {/* Recent Assignments */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Assignments</h2>
          <Link to="/assignments" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>
        {assignments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No assignments found.</p>
            {user.role === 'student' && (
              <Link to="/assignments/new" className="btn btn-primary mt-4 inline-block">
                Create Your First Assignment
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignments.map(assignment => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Chats */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Chats</h2>
          <Link to="/chats" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>
        {chats.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No chats found.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'student' && (
            <>
              <Link to="/assignments/new" className="btn btn-primary text-center">
                Create Assignment
              </Link>
              <Link to="/payments" className="btn btn-secondary text-center">
                View Payments
              </Link>
            </>
          )}
          {user.role === 'teacher' && (
            <>
              <Link to="/assignments" className="btn btn-primary text-center">
                Browse Assignments
              </Link>
              <Link to="/my-bids" className="btn btn-secondary text-center">
                View My Bids
              </Link>
            </>
          )}
          {user.role === 'super_admin' && (
            <>
              <Link to="/users" className="btn btn-primary text-center">
                Manage Users
              </Link>
              <Link to="/assignments" className="btn btn-secondary text-center">
                All Assignments
              </Link>
            </>
          )}
          <Link to="/chats" className="btn btn-secondary text-center">
            View Chats
          </Link>
          <Link to="/profile" className="btn btn-secondary text-center">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
