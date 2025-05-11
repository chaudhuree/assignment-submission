import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAssignment, deleteAssignment, markAsDelivered } from '../../services/assignmentService';
import { getBidsForAssignment } from '../../services/bidService';
import { getChatByAssignmentAndTeacher } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import BidList from '../bids/BidList';
import TeacherBidCard from '../bids/TeacherBidCard';
import SubmissionForm from './SubmissionForm';
import PaymentForm from '../payments/PaymentForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user } = useAuth();
  const { joinRoom, socket } = useSocket();
  const navigate = useNavigate();

  // Fetch assignment and bids data
  const fetchAssignmentAndBids = async () => {
    try {
      const assignmentRes = await getAssignment(id);
      setAssignment(assignmentRes.data);
      
      // Only fetch bids if the user is the student who created the assignment
      // or if they are a super_admin
      if (
        user.role === 'super_admin' || 
        (user.role === 'student' && assignmentRes.data.student._id === user.id)
      ) {
        const bidsRes = await getBidsForAssignment(id);
        setBids(bidsRes.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assignment details');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAssignmentAndBids();
    
    // Join socket room for this assignment
    joinRoom(id);
  }, [id, user, joinRoom]);
  
  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Handle new bid notifications
    const handleNewBid = (data) => {
      if (data.assignmentId === id) {
        // For student: Show toast notification about new bid
        if (user.role === 'student' && assignment?.student._id === user.id) {
          toast.info(`New bid received from ${data.teacherName}: $${data.bidAmount}`, {
            position: "top-right",
            autoClose: 5000
          });
          // Refresh bids
          fetchAssignmentAndBids();
        }
      }
    };
    
    // Handle bid updates
    const handleBidUpdated = (data) => {
      if (data.assignmentId === id) {
        // For student: Show toast notification about updated bid
        if (user.role === 'student' && assignment?.student._id === user.id) {
          toast.info(`${data.teacherName} updated their bid to $${data.bidAmount}`, {
            position: "top-right",
            autoClose: 5000
          });
          // Refresh bids
          fetchAssignmentAndBids();
        }
      }
    };
    
    // Handle assignment status updates
    const handleStatusUpdate = (data) => {
      if (data.assignmentId === id) {
        // For teacher: Show toast notification about bid acceptance/rejection
        if (user.role === 'teacher') {
          if (data.teacherId === user.id) {
            toast.success(`Your bid has been accepted for assignment: ${assignment?.title}`, {
              position: "top-right",
              autoClose: 5000
            });
          } else if (data.previousBidders && data.previousBidders.includes(user.id)) {
            toast.info(`Assignment "${assignment?.title}" has been assigned to another teacher. Better luck next time!`, {
              position: "top-right",
              autoClose: 5000
            });
          }
        }
        
        // Refresh assignment data
        fetchAssignmentAndBids();
      }
    };
    
    // Listen for events
    socket.on('new_bid', handleNewBid);
    socket.on('bid_updated', handleBidUpdated);
    socket.on('status_update', handleStatusUpdate);
    
    // Cleanup
    return () => {
      socket.off('new_bid', handleNewBid);
      socket.off('bid_updated', handleBidUpdated);
      socket.off('status_update', handleStatusUpdate);
    };
  }, [socket, id, user, assignment]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle assignment deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(id);
        navigate('/assignments');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete assignment');
      }
    }
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

  // Check if the user is the student who created this assignment
  const isStudent = user && assignment && user.id === assignment.student._id;
  
  // Check if the user is the assigned teacher
  const isAssignedTeacher = user && assignment && assignment.assignedTo && 
    (typeof assignment.assignedTo === 'object' ? 
      user.id === assignment.assignedTo._id : 
      user.id === assignment.assignedTo);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        <p>{error}</p>
        <Link to="/assignments" className="text-red-700 font-medium hover:underline mt-2 inline-block">
          Back to Assignments
        </Link>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Assignment not found.</p>
        <Link to="/assignments" className="btn btn-primary mt-4 inline-block">
          Back to Assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ToastContainer />
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Posted by {assignment.student.name} on {formatDate(assignment.createdAt)}
          </p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(assignment.status)}`}>
          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{assignment.description}</p>
          </div>

          {/* Show submission form for assigned teacher if assignment is assigned */}
          {isAssignedTeacher && assignment.status === 'assigned' && (
            <SubmissionForm assignmentId={assignment._id} />
          )}

          {/* Show payment form for student if assignment is completed and not paid */}
          {isStudent && assignment.status === 'completed' && !assignment.isPaid && (
            <PaymentForm 
              assignmentId={assignment._id} 
              amount={assignment.finalBid || assignment.price} 
              teacherId={assignment.assignedTo._id}
            />
          )}

          {/* Show bids if the user is the student who created this assignment */}
          {isStudent && assignment.status === 'pending' && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Bids</h3>
              <BidList bids={bids} assignmentId={assignment._id} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium">{assignment.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">${assignment.price}</p>
              </div>
              {assignment.finalBid && (
                <div>
                  <p className="text-sm text-gray-500">Final Bid</p>
                  <p className="font-medium text-green-600">${assignment.finalBid}</p>
                </div>
              )}
              {assignment.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">{assignment.assignedTo.name}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium capitalize">{assignment.status}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Actions</h3>
            <div className="space-y-3">
              {/* Teacher actions */}
              {user.role === 'teacher' && assignment.status === 'pending' && (
                <TeacherBidCard 
                  assignmentId={assignment._id} 
                  onBidUpdate={fetchAssignmentAndBids}
                  showPlaceBidButton={true}
                />
              )}
              
              {/* Teacher submission options */}
              {isAssignedTeacher && (
                <>
                  {/* Show submission form for assigned teacher */}
                  {assignment.status === 'assigned' && !assignment.submissionFileUrl && (
                    <SubmissionForm assignmentId={assignment._id} onSubmissionComplete={fetchAssignmentAndBids} />
                  )}
                  
                  {/* Show submitted files and update option */}
                  {assignment.submissionFileUrl && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-md">
                        <h4 className="font-medium text-sm mb-2">Submitted Files:</h4>
                        <div className="space-y-2">
                          <a 
                            href={assignment.submissionFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Full Submission
                          </a>
                          {assignment.previewFileUrl && (
                            <a 
                              href={assignment.previewFileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Preview File
                            </a>
                          )}
                        </div>
                      </div>
                      <SubmissionForm 
                        assignmentId={assignment._id} 
                        onSubmissionComplete={fetchAssignmentAndBids} 
                        isUpdate={true} 
                      />
                    </div>
                  )}
                </>
              )}

              {/* Student actions */}
              {isStudent && assignment.status === 'pending' && (
                <button
                  onClick={handleDelete}
                  className="btn btn-danger w-full"
                >
                  Delete Assignment
                </button>
              )}

              {/* Chat with assigned teacher or student */}
              {((isStudent && assignment.assignedTo) || 
                (isAssignedTeacher && assignment.student)) && (
                <button
                  onClick={async () => {
                    try {
                      setLoadingChat(true);
                      // Make sure we're using the string ID, not the object
                      const teacherId = isStudent 
                        ? (typeof assignment.assignedTo === 'object' ? assignment.assignedTo._id : assignment.assignedTo)
                        : user.id;
                      
                      console.log('Navigating to chat with teacher ID:', teacherId);
                      console.log('Assignment ID:', assignment._id);
                      
                      const response = await getChatByAssignmentAndTeacher(assignment._id, teacherId);
                      console.log('Chat response:', response);
                      
                      if (response.data && response.data._id) {
                        navigate(`/chats/${response.data._id}`);
                      } else {
                        setError('Could not find or create chat');
                      }
                    } catch (err) {
                      console.error('Chat navigation error:', err);
                      setError(err.response?.data?.message || 'Failed to access chat');
                    } finally {
                      setLoadingChat(false);
                    }
                  }}
                  disabled={loadingChat}
                  className="btn btn-secondary w-full block text-center"
                >
                  {loadingChat ? 'Loading Chat...' : (isStudent ? 'Chat with Teacher' : 'Chat with Student')}
                </button>
              )}

              {/* Download completed assignment if paid */}
              {isStudent && assignment.isPaid && assignment.submissionFileUrl && (
                <a
                  href={assignment.submissionFileUrl}
                  className="btn btn-primary w-full block text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Assignment
                </a>
              )}

              {/* Preview assignment if available */}
              {isStudent && assignment.previewFileUrl && (
                <a
                  href={assignment.previewFileUrl}
                  className="btn btn-secondary w-full block text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview Assignment
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
