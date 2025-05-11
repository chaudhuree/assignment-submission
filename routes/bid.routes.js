const express = require('express');
const router = express.Router();
const Bid = require('../models/bid.model');
const Assignment = require('../models/assignment.model');
const Chat = require('../models/chat.model');
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const socketModule = require('../socket');
const { createBid, getBidsForAssignment, getBidsForTeacher, acceptBid, getTeacherBidForAssignment, updateBid, deleteBid } = require('../controllers/bid.controller');

// Create a new bid (teacher only)
router.post('/', protect, authorize('teacher'), createBid);

// Get all bids for an assignment (student or super_admin only)
router.get('/assignment/:assignmentId', protect, getBidsForAssignment);

// Get all bids by a teacher (teacher only)
router.get('/teacher', protect, authorize('teacher'), getBidsForTeacher);

// Accept a bid (student only)
router.put('/:id/accept', protect, authorize('student'), acceptBid);

// Get teacher's bid for a specific assignment (teacher only)
router.get('/teacher/assignment/:assignmentId', protect,authorize('teacher'), getTeacherBidForAssignment);

// Update a bid (teacher only)
router.put('/:id', protect, authorize('teacher'), updateBid);

// Delete a bid (teacher only)
router.delete('/:id', protect, authorize('teacher'), deleteBid);

module.exports = router;
