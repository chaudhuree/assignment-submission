const Chat = require('../models/chat.model');
const Assignment = require('../models/assignment.model');

const getChats =async (req, res) => {
  try {
    let chats;
    
    if (req.user.role === 'student') {
      chats = await Chat.find({ student: req.user.id })
        .populate('teacher', 'name')
        .populate('assignment', 'title subject')
        .sort({ updatedAt: -1 });
    } else if (req.user.role === 'teacher') {
      chats = await Chat.find({ teacher: req.user.id })
        .populate('student', 'name')
        .populate('assignment', 'title subject')
        .sort({ updatedAt: -1 });
    } else {
      // super_admin can see all chats
      chats = await Chat.find()
        .populate('student', 'name')
        .populate('teacher', 'name')
        .populate('assignment', 'title subject')
        .sort({ updatedAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getChat =async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('student', 'name')
      .populate('teacher', 'name')
      .populate('assignment', 'title subject status finalBid');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has permission to view this chat
    const studentId = chat.student._id ? chat.student._id.toString() : chat.student.toString();
    const teacherId = chat.teacher._id ? chat.teacher._id.toString() : chat.teacher.toString();
    const userId = req.user.id.toString();
    
    if (
      req.user.role !== 'super_admin' && 
      studentId !== userId && 
      teacherId !== userId
    ) {
      console.log('Auth check failed:', {
        userRole: req.user.role,
        userId: userId,
        chatStudent: studentId,
        chatTeacher: teacherId
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const createChat =async (req, res) => {
  try {
    const { assignmentId, initialMessage } = req.body;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Determine teacher and student based on user role
    let teacherId, studentId;
    
    if (req.user.role === 'teacher') {
      teacherId = req.user.id;
      studentId = assignment.student;
    } else if (req.user.role === 'student') {
      studentId = req.user.id;
      teacherId = req.body.teacherId;
      
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and students can create chats'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      assignment: assignmentId,
      teacher: teacherId,
      student: studentId
    });

    if (chat) {
      return res.status(400).json({
        success: false,
        message: 'Chat already exists',
        data: chat
      });
    }

    // Create new chat
    chat = await Chat.create({
      assignment: assignmentId,
      teacher: teacherId,
      student: studentId,
      messages: initialMessage ? [
        {
          sender: req.user.id,
          content: initialMessage
        }
      ] : []
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getChatByAssignmentAndTeacher =async (req, res) => {
  try {
    const { assignmentId, teacherId } = req.params;
    
    // First try to find an existing chat
    let chat = await Chat.findOne({
      assignment: assignmentId,
      teacher: teacherId
    });
    
    // If no chat exists, check if the assignment exists and is assigned to this teacher
    if (!chat) {
      const assignment = await Assignment.findById(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }
      
      // For students: check if they own the assignment
      // For teachers: check if they are assigned to this assignment
      if (
        (req.user.role === 'student' && assignment.student.toString() !== req.user.id) ||
        (req.user.role === 'teacher' && teacherId !== req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this chat'
        });
      }
      
      // Create a new chat if the assignment is assigned to this teacher
      if (assignment.assignedTo && assignment.assignedTo.toString() === teacherId) {
        chat = await Chat.create({
          assignment: assignmentId,
          student: assignment.student,
          teacher: teacherId,
          messages: []
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Cannot create chat: assignment is not assigned to this teacher'
        });
      }
    }
    
    // Populate the chat data
    const populatedChat = await Chat.findById(chat._id)
      .populate('student', 'name')
      .populate('teacher', 'name')
      .populate('assignment', 'title subject status finalBid');
    
    res.status(200).json({
      success: true,
      data: populatedChat
    });
  } catch (err) {
    console.error('Error in get chat by assignment and teacher:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const addMessageToChat=async (req, res) => {
  try {
    const { content, isBid, bidAmount } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has permission to add message to this chat
    const studentId = chat.student._id ? chat.student._id.toString() : chat.student.toString();
    const teacherId = chat.teacher._id ? chat.teacher._id.toString() : chat.teacher.toString();
    const userId = req.user.id.toString();
    
    if (studentId !== userId && teacherId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add message to this chat'
      });
    }

    // Add message to chat
    const newMessage = {
      sender: req.user.id,
      content,
      timestamp: Date.now()
    };

    // If this is a bid message (teacher only)
    if (isBid && req.user.role === 'teacher') {
      newMessage.isBid = true;
      newMessage.bidAmount = bidAmount;
    }

    chat.messages.push(newMessage);
    chat.updatedAt = Date.now();
    await chat.save();

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
module.exports = {
  getChats,
  getChat,
  createChat,
  getChatByAssignmentAndTeacher,
  addMessageToChat
};
