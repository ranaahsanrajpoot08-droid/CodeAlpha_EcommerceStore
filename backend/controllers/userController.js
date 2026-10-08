const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, isNonEmpty } = require('../utils/validators');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/profile   Body: { name, email, password? }
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!isNonEmpty(name) || name.trim().length < 2) throw new AppError('Name must be at least 2 characters.', 400);
  if (!isEmail(email)) throw new AppError('Please enter a valid email address.', 400);
  if (password && (typeof password !== 'string' || password.length < 6)) {
    throw new AppError('New password must be at least 6 characters.', 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const other = await User.findByEmail(cleanEmail);
  if (other && other.id !== req.user.id) throw new AppError('That email is already used by another account.', 400);

  const hashed = password ? await bcrypt.hash(password, 10) : null;
  await User.updateProfile(req.user.id, { name: name.trim(), email: cleanEmail, password: hashed });

  res.json({ user: await User.findById(req.user.id) });
});

// GET /api/admin/users  (admin)
exports.getAllUsers = asyncHandler(async (req, res) => {
  res.json({ users: await User.getAll() });
});
