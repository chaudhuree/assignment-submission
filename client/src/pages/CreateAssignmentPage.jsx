import React from 'react';
import AssignmentForm from '../components/assignments/AssignmentForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateAssignmentPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Assignment</h2>
      <AssignmentForm />
    </div>
  );
};

export default CreateAssignmentPage;
