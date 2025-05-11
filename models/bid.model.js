const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide a bid amount']
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a teacher can only place one bid per assignment
BidSchema.index({ assignment: 1, teacher: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
