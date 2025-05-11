import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import AssignmentCard from './AssignmentCard';
import socket from '../../services/socketService';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const { user } = useAuth();

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await getAssignments(filter);
      setAssignments(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch assignments');
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Socket.io event listeners for real-time updates
  useEffect(() => {
    // When a new assignment is created
    const handleNewAssignment = (data) => {
      console.log('New assignment received:', data);
      
      // Only update for teachers with matching subject or super_admin
      if (user.role === 'super_admin' || 
         (user.role === 'teacher' && 
          (!filter || filter === data.subject) && 
          (user.subjects?.includes(data.subject) || !user.subjects?.length))) {
        
        // Add the new assignment to the list if it's not already there
        setAssignments(prevAssignments => {
          const exists = prevAssignments.some(a => a._id === data.assignment._id);
          if (!exists) {
            return [data.assignment, ...prevAssignments];
          }
          return prevAssignments;
        });
      }
    };

    // Join subject rooms if user is a teacher
    if (user && user.role === 'teacher' && user.subjects?.length) {
      socket.emit('join_subject_rooms', user.subjects);
    }

    // Listen for new assignments
    socket.on('new_assignment', handleNewAssignment);

    // Cleanup
    return () => {
      socket.off('new_assignment', handleNewAssignment);
    };
  }, [user, filter]);

  // List of common subjects for filtering
  const subjectOptions = [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Business Studies',
    'Accounting',
    'Psychology',
    'Sociology',
    'Political Science',
    'Philosophy',
    'Engineering',
    'Medicine',
    'Law',
    'Art',
    'Music'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>
        {user && user.role === 'student' && (
          <Link to="/assignments/new" className="btn btn-primary">
            Create Assignment
          </Link>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Subject
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">All Subjects</option>
          {subjectOptions.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <p>{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No assignments found.</p>
          {user && user.role === 'student' && (
            <Link to="/assignments/new" className="btn btn-primary mt-4 inline-block">
              Create Your First Assignment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
