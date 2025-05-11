import React from 'react';
import BidForm from '../components/bids/BidForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BidFormPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'teacher') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <BidForm />
    </div>
  );
};

export default BidFormPage;
