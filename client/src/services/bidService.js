import api from './api';

// Create a new bid (teacher)
export const createBid = async (bidData) => {
  const response = await api.post('/bids', bidData);
  return response.data;
};

// Get all bids for an assignment (student)
export const getBidsForAssignment = async (assignmentId) => {
  const response = await api.get(`/bids/assignment/${assignmentId}`);
  return response.data;
};

// Get all bids by teacher (teacher)
export const getTeacherBids = async () => {
  const response = await api.get('/bids/teacher');
  return response.data;
};

// Get teacher's bid for a specific assignment (teacher)
export const getTeacherBidForAssignment = async (assignmentId) => {
  const response = await api.get(`/bids/teacher/assignment/${assignmentId}`);
  return response.data;
};

// Update a bid (teacher)
export const updateBid = async (bidId, bidData) => {
  const response = await api.put(`/bids/${bidId}`, bidData);
  return response.data;
};

// Accept a bid (student)
export const acceptBid = async (bidId) => {
  const response = await api.put(`/bids/${bidId}/accept`);
  return response.data;
};

// Delete a bid (teacher)
export const deleteBid = async (bidId) => {
  const response = await api.delete(`/bids/${bidId}`);
  return response.data;
};
