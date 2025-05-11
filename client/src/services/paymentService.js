import api from './api';

// Create a new payment (student)
export const createPayment = async (paymentData) => {
  const response = await api.post('/payments', paymentData);
  return response.data;
};

// Get all payments for current user
export const getPayments = async () => {
  const response = await api.get('/payments');
  return response.data;
};

// Get single payment
export const getPayment = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

// Get payments for an assignment
export const getPaymentsForAssignment = async (assignmentId) => {
  const response = await api.get(`/payments/assignment/${assignmentId}`);
  return response.data;
};
