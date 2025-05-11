const express = require('express');
const router = express.Router();
const Payment = require('../models/payment.model');
const Assignment = require('../models/assignment.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const { createPayment, getPayment, getPayments, getPaymentsByAssignment } = require('../controllers/payment.controller');

// Create a new payment (student only)
router.post('/', protect, authorize('student'), createPayment);

// Get all payments for current user
router.get('/', protect, getPayments);

// Get single payment
router.get('/:id', protect, getPayment);

// Get payments for an assignment
router.get('/assignment/:assignmentId', protect, getPaymentsByAssignment);

module.exports = router;
