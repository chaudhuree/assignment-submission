const express = require('express');
const router = express.Router();
const Chat = require('../models/chat.model');
const Assignment = require('../models/assignment.model');
const { protect } = require('../middleware/auth.middleware');
const { getChats, getChat, createChat, getChatByAssignmentAndTeacher, addMessageToChat } = require('../controllers/chat.controller');

// Get all chats for current user
router.get('/', protect, getChats);

// Get single chat
router.get('/:id', protect, getChat);

// Create a new chat (teacher only - when bidding on an assignment)
router.post('/', protect, createChat);

// Get chat by assignment and teacher
router.get('/assignment/:assignmentId/teacher/:teacherId', protect, getChatByAssignmentAndTeacher);

// Add message to chat
router.post('/:id/messages', protect, addMessageToChat);



module.exports = router;
