const User = require('../models/User');

// @desc  Create a new user
// @route POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, department, status } = req.body;
    if (!name || !email || !department) {
      const err = new Error('Name, email, and department are required');
      err.statusCode = 400;
      return next(err);
    }
    const user = await User.create({ name, email, department, status });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      err.message = 'Email already exists';
      err.statusCode = 409;
    }
    next(err);
  }
};

// @desc  Get all users (with optional search)
// @route GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single user
// @route GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc  Update user
// @route PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, getUser, updateUser };
