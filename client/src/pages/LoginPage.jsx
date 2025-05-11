import React from 'react';
import Login from '../components/auth/Login';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <Login />
    </div>
  );
};

export default LoginPage;
