import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MyBidsList from '../components/bids/MyBidsList';

const MyBidsPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'teacher') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Bids</h2>
      <MyBidsList />
    </div>
  );
};

export default MyBidsPage;
