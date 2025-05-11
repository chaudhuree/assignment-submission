const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const { registerUser,loginUser,currentUser ,getUsers,getTeachers,updateUser,deleteUser} = require('../controllers/auth.controller');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get current logged in user
router.get('/me', protect, currentUser);

// Get all users (super_admin only)
router.get('/users', protect, authorize('super_admin'), getUsers);

// Get all teachers
router.get('/teachers', protect, getTeachers);

// Update user
router.put('/users/:id', protect, authorize('super_admin'), updateUser);

// Delete user
router.delete('/users/:id', protect, authorize('super_admin'), deleteUser);

module.exports = router;
