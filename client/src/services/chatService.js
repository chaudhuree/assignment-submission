import api from './api';

// Get all chats for current user
export const getChats = async () => {
  const response = await api.get('/chats');
  return response.data;
};

// Get single chat
export const getChat = async (id) => {
  const response = await api.get(`/chats/${id}`);
  return response.data;
};

// Create a new chat
export const createChat = async (chatData) => {
  const response = await api.post('/chats', chatData);
  return response.data;
};

// Add message to chat
export const addMessage = async (chatId, messageData) => {
  const response = await api.post(`/chats/${chatId}/messages`, messageData);
  return response.data;
};

// Get chat by assignment and teacher
export const getChatByAssignmentAndTeacher = async (assignmentId, teacherId) => {
  const response = await api.get(`/chats/assignment/${assignmentId}/teacher/${teacherId}`);
  return response.data;
};
