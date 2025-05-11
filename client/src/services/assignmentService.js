import api from './api';

// Get all assignments
export const getAssignments = async (subject = '') => {
  const query = subject ? `?subject=${subject}` : '';
  const response = await api.get(`/assignments${query}`);
  return response.data;
};

// Get single assignment
export const getAssignment = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

// Create new assignment
export const createAssignment = async (assignmentData) => {
  const response = await api.post('/assignments', assignmentData);
  return response.data;
};

// Update assignment status - complete (teacher)
export const completeAssignment = async (id, fileData) => {
  const response = await api.put(`/assignments/${id}/complete`, fileData);
  return response.data;
};

// Update assignment submission files (teacher)
export const updateSubmission = async (id, fileData) => {
  const response = await api.put(`/assignments/${id}/update-submission`, fileData);
  return response.data;
};

// Accept bid (student)
export const acceptBid = async (id, bidData) => {
  const response = await api.put(`/assignments/${id}/accept-bid`, bidData);
  return response.data;
};

// Mark as delivered after payment (student)
export const markAsDelivered = async (id) => {
  const response = await api.put(`/assignments/${id}/delivered`);
  return response.data;
};

// Delete assignment
export const deleteAssignment = async (id) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};

// Get preview file
export const getPreviewFile = async (id) => {
  const response = await api.get(`/assignments/${id}/preview`, {
    responseType: 'blob'
  });
  return response.data;
};

// Download full assignment
export const downloadAssignment = async (id) => {
  const response = await api.get(`/assignments/${id}/download`, {
    responseType: 'blob'
  });
  return response.data;
};
