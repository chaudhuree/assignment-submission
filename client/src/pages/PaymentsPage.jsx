import React from 'react';
import PaymentHistory from '../components/payments/PaymentHistory';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PaymentsPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <PaymentHistory />
    </div>
  );
};

export default PaymentsPage;
