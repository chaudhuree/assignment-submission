const Payment = require('../models/payment.model');
const Assignment = require('../models/assignment.model');

const createPayment =async (req, res) => {
  try {
    const { assignmentId, paymentMethod, transactionId } = req.body;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student owns this assignment
    if (assignment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this assignment'
      });
    }

    // Check if assignment is completed
    if (assignment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot make payment for an assignment that is not completed'
      });
    }

    // Check if assignment is already paid
    if (assignment.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Assignment is already paid'
      });
    }

    // Create payment
    const payment = await Payment.create({
      assignment: assignmentId,
      student: req.user.id,
      teacher: assignment.assignedTo,
      amount: assignment.finalBid,
      paymentMethod,
      transactionId,
      status: 'completed'
    });

    // Update assignment
    assignment.isPaid = true;
    assignment.status = 'delivered';
    await assignment.save();

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getPayments =async (req, res) => {
  try {
    let payments;
    
    if (req.user.role === 'student') {
      payments = await Payment.find({ student: req.user.id })
        .populate('assignment', 'title')
        .populate('teacher', 'name')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'teacher') {
      payments = await Payment.find({ teacher: req.user.id })
        .populate('assignment', 'title')
        .populate('student', 'name')
        .sort({ createdAt: -1 });
    } else {
      // super_admin can see all payments
      payments = await Payment.find()
        .populate('assignment', 'title')
        .populate('student', 'name')
        .populate('teacher', 'name')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('assignment', 'title description subject price finalBid')
      .populate('student', 'name email')
      .populate('teacher', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user has permission to view this payment
    if (
      req.user.role !== 'super_admin' && 
      payment.student.toString() !== req.user.id && 
      payment.teacher.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getPaymentsByAssignment = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.assignmentId);
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
  
      // Check if user has permission to view payments for this assignment
      if (
        req.user.role !== 'super_admin' && 
        assignment.student.toString() !== req.user.id && 
        (assignment.assignedTo && assignment.assignedTo.toString() !== req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view payments for this assignment'
        });
      }
  
      const payments = await Payment.find({ assignment: req.params.assignmentId })
        .sort({ createdAt: -1 });
  
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
module.exports = {
  createPayment,
  getPayments,
  getPayment,
  getPaymentsByAssignment
};
