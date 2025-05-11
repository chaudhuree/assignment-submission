const User = require('../models/user.model');
const registerUser =async (req, res) => {
  try {
    const { name, email, password, role, subjects } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      subjects: subjects || []
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const loginUser    =async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


const currentUser =async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getUsers= async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects,
        createdAt: user.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const getTeachers =async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers.map(teacher => ({
        id: teacher._id,
        name: teacher.name,
        subjects: teacher.subjects
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

const updateUser =async (req, res) => {
    try {
      const { name, email, role, subjects } = req.body;
  
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, subjects },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subjects: user.subjects
        }
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  const deleteUser =async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
module.exports = {
  registerUser,
  loginUser,
  currentUser,
  getUsers,
  getTeachers,
  updateUser,
  deleteUser
};
