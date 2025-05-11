const express = require('express');
const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
const Assignment = require('../models/assignment.model');
const User = require('../models/user.model');
const Bid = require('../models/bid.model');
const { protect, authorize } = require('../middleware/auth.middleware');
const socketModule = require('../socket');
const { createAssignment, getAssignments, getAssignement, updateAssignmentStatus, updateAssignmentSubmission, acceptBid, markAssignmentAsDelivered, deleteAssignment, getPreviewFile, getFullSubmissionFile } = require('../controllers/assignment.controller');

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = './uploads/assignments';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     const filetypes = /pdf|doc|docx|zip/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true);
//     } else {
//       cb('Error: Only PDF, DOC, DOCX, and ZIP files are allowed!');
//     }
//   }
// });

// Create a new assignment (student only)
router.post(
  '/',
  protect,
  authorize('student'),
  createAssignment);

// Get all assignments
router.get('/', protect, getAssignments);

// Get single assignment
router.get('/:id', protect, getAssignement);

// Update assignment status (teacher only - for completing assignments)
router.put(
  '/:id/complete',
  protect,
  authorize('teacher'),
  updateAssignmentStatus);

// Update assignment submission files (teacher only)
router.put(
  '/:id/update-submission',
  protect,
  authorize('teacher'),
  updateAssignmentSubmission
);

// Accept assignment bid (student only)
router.put(
  '/:id/accept-bid',
  protect,
  authorize('student'),
  acceptBid
);

// Mark assignment as delivered after payment (student only)
router.put(
  '/:id/delivered',
  protect,
  authorize('student'),
  markAssignmentAsDelivered
);

// Delete assignment (student or super_admin only)
router.delete('/:id', protect, deleteAssignment);

// Get preview file (for students)
router.get('/:id/preview', protect, getPreviewFile);

// Get full submission file (for students who have paid)
router.get('/:id/download', protect, authorize('student'), getFullSubmissionFile);

module.exports = router;
