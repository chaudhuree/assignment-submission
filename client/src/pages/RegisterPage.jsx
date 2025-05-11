import React from 'react';
import Register from '../components/auth/Register';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      <Register />
    </div>
  );
};

export default RegisterPage;
