const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed', 'delivered'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  finalBid: {
    type: Number,
    default: null
  },
  submissionFile: {
    type: String,
    default: null
  },
  submissionFileUrl: {
    type: String,
    default: null
  },
  submissionFileId: {
    type: String,
    default: null
  },
  previewFile: {
    type: String,
    default: null
  },
  previewFileUrl: {
    type: String,
    default: null
  },
  previewFileId: {
    type: String,
    default: null
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
AssignmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
