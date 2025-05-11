const Assignment = require("../models/assignment.model");
const User = require("../models/user.model");
const Bid = require("../models/bid.model");
const socketModule = require("../socket");

const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, price } = req.body;

    // Create assignment
    const assignment = await Assignment.create({
      student: req.user.id,
      title,
      description,
      subject,
      price,
    });

    // Populate student information for the response
    const populatedAssignment = await Assignment.findById(
      assignment._id
    ).populate("student", "name email");

    // Find teachers who teach this subject to notify them
    const teachers = await User.find({
      role: "teacher",
      subjects: subject,
    }).select("_id");

    // Emit socket event for new assignment
    const io = socketModule.getIO();
    if (io) {
      io.emit("new_assignment", {
        assignment: populatedAssignment,
        subject: subject,
        teacherIds: teachers.map((teacher) => teacher._id.toString()),
      });
    } else {
      console.log("Socket.io instance not available");
    }

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    let query;

    // Filter by subject if provided
    if (req.query.subject) {
      query = { subject: req.query.subject };
    } else {
      query = {};
    }

    // Different queries based on user role
    if (req.user.role === "student") {
      // Students can only see their own assignments
      query.student = req.user.id;
    } else if (req.user.role === "teacher") {
      // Create an OR query for teachers
      if (req.query.status) {
        // If specific status is requested
        if (
          req.query.status === "assigned" ||
          req.query.status === "completed"
        ) {
          // For assigned/completed assignments, only show those assigned to this teacher
          query.assignedTo = req.user.id;
          query.status = req.query.status;
        } else if (req.query.status === "pending") {
          // For pending assignments, show those in teacher's subjects
          query.status = "pending";
          if (req.user.subjects && req.user.subjects.length > 0) {
            query.subject = { $in: req.user.subjects };
          }
        }
      } else {
        // If no status filter, show both pending in subjects AND assigned to this teacher
        query.$or = [
          // Pending assignments in teacher's subjects
          {
            status: "pending",
            subject: { $in: req.user.subjects || [] },
          },
          // Any status assignments assigned to this teacher
          {
            assignedTo: req.user.id,
          },
        ];
      }
    }
    // super_admin can see all assignments

    // Execute query
    const assignments = await Assignment.find(query)
      .populate("student", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAssignement = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("student", "name email")
      .populate("assignedTo", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user has permission to view this assignment
    if (
      req.user.role === "student" &&
      assignment.student.toString() !== req.user.id &&
      req.user.role === "teacher" &&
      (assignment.status !== "pending" ||
        (assignment.assignedTo &&
          assignment.assignedTo.toString() !== req.user.id))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this assignment",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateAssignmentStatus = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if teacher is assigned to this assignment
    if (assignment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this assignment",
      });
    }

    // Extract Cloudinary file URLs and metadata from request body
    const {
      submissionFileUrl,
      submissionFileId,
      previewFileUrl,
      previewFileId,
    } = req.body;

    // Validate required fields
    if (!submissionFileUrl || !previewFileUrl) {
      return res.status(400).json({
        success: false,
        message: "Both submission file and preview file are required",
      });
    }

    // Update assignment
    assignment.status = "completed";
    assignment.submissionFileUrl = submissionFileUrl;
    assignment.submissionFileId = submissionFileId;
    assignment.previewFileUrl = previewFileUrl;
    assignment.previewFileId = previewFileId;

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateAssignmentSubmission = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if teacher is assigned to this assignment
    if (assignment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this assignment",
      });
    }

    // Validate request body
    const {
      submissionFileUrl,
      submissionFileId,
      previewFileUrl,
      previewFileId,
    } = req.body;

    if (!submissionFileUrl || !previewFileUrl) {
      return res.status(400).json({
        success: false,
        message: "Both submission and preview files are required",
      });
    }

    // Update assignment with new file URLs
    assignment.submissionFileUrl = submissionFileUrl;
    assignment.submissionFileId = submissionFileId;
    assignment.previewFileUrl = previewFileUrl;
    assignment.previewFileId = previewFileId;
    assignment.updatedAt = Date.now();

    await assignment.save();

    // Emit socket event for assignment update
    const io = socketModule.getIO();
    if (io) {
      io.to(assignment._id.toString()).emit("status_update", {
        assignmentId: assignment._id,
        status: "files_updated",
        message: "Assignment files have been updated by the teacher",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const acceptBid =  async (req, res) => {
    try {
      const { teacherId, bidAmount } = req.body;

      const assignment = await Assignment.findById(req.params.id);

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
          message: 'Not authorized to update this assignment'
        });
      }

      // Update assignment
      assignment.status = 'assigned';
      assignment.assignedTo = teacherId;
      assignment.finalBid = bidAmount;

      await assignment.save();

      // Get all teachers who have bid on this assignment (for notifications)
      const bids = await Bid.find({ assignment: assignment._id }).distinct('teacher');
      
      // Emit socket event for assignment status update
      const io = socketModule.getIO();
      if (io) {
        // Send notification to the assigned teacher
        io.emit('status_update', {
          assignmentId: assignment._id,
          status: 'assigned',
          teacherId: teacherId,
          previousBidders: bids.map(bid => bid.toString())
        });
      }

      res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

const markAssignmentAsDelivered = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);

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
          message: 'Not authorized to update this assignment'
        });
      }

      // Update assignment
      assignment.status = 'delivered';
      assignment.isPaid = true;

      await assignment.save();

      res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
const deleteAssignment =async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if user has permission to delete this assignment
    if (
      req.user.role !== 'super_admin' && 
      (req.user.role !== 'student' || assignment.student.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }

    // Only allow deletion if status is pending
    if (assignment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assignment that is already assigned or completed'
      });
    }

    await assignment.remove();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
const getPreviewFile =async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if preview file exists
    if (!assignment.previewFileUrl) {
      return res.status(404).json({
        success: false,
        message: 'No preview file available'
      });
    }

    // Redirect to the Cloudinary URL
    res.status(200).json({
      success: true,
      fileUrl: assignment.previewFileUrl
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getFullSubmissionFile = async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);
  
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
          message: 'Not authorized to download this assignment'
        });
      }
  
      // Check if assignment is paid
      if (!assignment.isPaid) {
        return res.status(403).json({
          success: false,
          message: 'Payment required to download the full assignment'
        });
      }
  
      // Check if submission file exists
      if (!assignment.submissionFileUrl) {
        return res.status(404).json({
          success: false,
          message: 'No submission file available'
        });
      }
  
      // Return the Cloudinary URL
      res.status(200).json({
        success: true,
        fileUrl: assignment.submissionFileUrl
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
module.exports = {
  createAssignment,
  getAssignments,
  getAssignement,
  updateAssignmentStatus,
  updateAssignmentSubmission,
  acceptBid,
  markAssignmentAsDelivered,
  deleteAssignment,
  getPreviewFile,
  getFullSubmissionFile
};
