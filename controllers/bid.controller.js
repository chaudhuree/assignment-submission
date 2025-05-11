const Bid = require("../models/bid.model");
const Assignment = require("../models/assignment.model");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const socketModule = require("../socket");

const createBid = async (req, res) => {
  try {
    const { assignmentId, amount, message } = req.body;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if assignment is still pending
    if (assignment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot bid on an assignment that is already assigned or completed",
      });
    }

    // Check if teacher already has a bid for this assignment
    const existingBid = await Bid.findOne({
      assignment: assignmentId,
      teacher: req.user.id,
    });

    if (existingBid) {
      // Update existing bid
      existingBid.amount = amount;
      existingBid.message = message;
      await existingBid.save();

      // Also add bid message to chat if it exists
      const chat = await Chat.findOne({
        assignment: assignmentId,
        teacher: req.user.id,
        student: assignment.student,
      });

      if (chat) {
        chat.messages.push({
          sender: req.user.id,
          content: `I've updated my bid to $${amount}`,
          isBid: true,
          bidAmount: amount,
        });
        await chat.save();
      }

      return res.status(200).json({
        success: true,
        data: existingBid,
      });
    }

    // Create new bid
    const bid = await Bid.create({
      assignment: assignmentId,
      teacher: req.user.id,
      amount,
      message,
    });

    // Create or update chat with bid message
    let chat = await Chat.findOne({
      assignment: assignmentId,
      teacher: req.user.id,
      student: assignment.student,
    });

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        assignment: assignmentId,
        teacher: req.user.id,
        student: assignment.student,
        messages: [
          {
            sender: req.user.id,
            content: `I'm interested in your assignment and I'm bidding $${amount}`,
            isBid: true,
            bidAmount: amount,
          },
        ],
      });
    } else {
      // Add bid message to existing chat
      chat.messages.push({
        sender: req.user.id,
        content: `I'm bidding $${amount} for your assignment`,
        isBid: true,
        bidAmount: amount,
      });
      await chat.save();
    }

    // Get teacher name for the notification
    const teacher = await User.findById(req.user.id).select("name");

    // Emit socket event for new bid
    const io = socketModule.getIO();
    if (io) {
      io.emit("new_bid", {
        assignmentId,
        teacherId: req.user.id,
        teacherName: teacher.name,
        bidAmount: amount,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: bid,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBidsForAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if user has permission to view bids for this assignment
    if (
      req.user.role !== "super_admin" &&
      (req.user.role !== "student" ||
        assignment.student.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bids for this assignment",
      });
    }

    const bids = await Bid.find({ assignment: req.params.assignmentId })
      .populate("teacher", "name email subjects")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getBidsForTeacher = async (req, res) => {
  try {
    // Get all bids by this teacher with populated assignment details
    const bids = await Bid.find({ teacher: req.user.id })
      .populate({
        path: "assignment",
        populate: {
          path: "student",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    // For each bid, check if there's a chat and add the chatId to the response
    const bidsWithChatInfo = await Promise.all(
      bids.map(async (bid) => {
        const bidObj = bid.toObject();

        // Find chat for this assignment and teacher
        const chat = await Chat.findOne({
          assignment: bid.assignment._id,
          teacher: req.user.id,
        });

        if (chat) {
          bidObj.chatId = chat._id;
        }

        return bidObj;
      })
    );

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bidsWithChatInfo,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate("assignment");

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    // Check if student owns the assignment
    if (bid.assignment.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this bid",
      });
    }

    // Update bid status
    bid.status = "accepted";
    await bid.save();

    // Update assignment status
    const assignment = await Assignment.findById(bid.assignment._id);
    assignment.status = "assigned";
    assignment.assignedTo = bid.teacher;
    assignment.finalBid = bid.amount;
    await assignment.save();

    // Update all other bids for this assignment to rejected
    await Bid.updateMany(
      {
        assignment: bid.assignment._id,
        _id: { $ne: bid._id },
      },
      { status: "rejected" }
    );

    // Add message to chat
    const chat = await Chat.findOne({
      assignment: bid.assignment._id,
      teacher: bid.teacher,
      student: req.user.id,
    });

    if (chat) {
      chat.messages.push({
        sender: req.user.id,
        content: `I've accepted your bid of $${bid.amount}. You can now start working on the assignment.`,
        timestamp: Date.now(),
      });
      await chat.save();
    }

    // Get all teachers who bid on this assignment for notifications
    const allBids = await Bid.find({ assignment: bid.assignment._id }).distinct(
      "teacher"
    );
    const previousBidders = allBids.filter(
      (teacherId) => teacherId.toString() !== bid.teacher.toString()
    );

    // Get teacher name
    const teacher = await User.findById(bid.teacher).select("name");

    // Emit socket event for assignment status update
    const io = socketModule.getIO();
    if (io) {
      io.emit("status_update", {
        assignmentId: bid.assignment._id,
        status: "assigned",
        teacherId: bid.teacher.toString(),
        teacherName: teacher.name,
        bidAmount: bid.amount,
        previousBidders: previousBidders.map((id) => id.toString()),
        title: assignment.title,
      });
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getTeacherBidForAssignment = async (req, res) => {
  try {
    // Find the teacher's bid for this assignment
    const bid = await Bid.findOne({
      assignment: req.params.assignmentId,
      teacher: req.user.id,
    }).populate({
      path: "assignment",
      select: "title description subject price status",
      populate: {
        path: "student",
        select: "name email",
      },
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "No bid found for this assignment",
      });
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateBid = async (req, res) => {
  try {
    const { amount, message } = req.body;

    // Find the bid
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    // Check if teacher owns this bid
    if (bid.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this bid",
      });
    }

    // Only allow updates if bid is still pending
    if (bid.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot update bid that has been accepted or rejected",
      });
    }

    // Update bid
    bid.amount = amount;
    bid.message = message;
    await bid.save();

    // Update chat with new bid message
    const assignment = await Assignment.findById(bid.assignment);
    const chat = await Chat.findOne({
      assignment: bid.assignment,
      teacher: req.user.id,
      student: assignment.student,
    });

    if (chat) {
      chat.messages.push({
        sender: req.user.id,
        content: `I've updated my bid to $${amount}`,
        isBid: true,
        bidAmount: amount,
      });
      await chat.save();
    }

    // Get teacher name for the notification
    const teacher = await User.findById(req.user.id).select("name");

    // Emit socket event for updated bid
    const io = socketModule.getIO();
    if (io) {
      io.emit("bid_updated", {
        assignmentId: bid.assignment,
        teacherId: req.user.id,
        teacherName: teacher.name,
        bidAmount: amount,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    // Check if teacher owns this bid
    if (bid.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this bid",
      });
    }

    // Only allow deletion if bid is still pending
    if (bid.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete bid that has been accepted or rejected",
      });
    }

    await bid.remove();

    res.status(200).json({
      success: true,
      message: "Bid deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
module.exports = {
  createBid,
  getBidsForAssignment,
  getBidsForTeacher,
  acceptBid,
  getTeacherBidForAssignment,
  updateBid,
  deleteBid,
};
