const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { isEmail, isNonEmpty } = require('../utils/validators');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!isNonEmpty(name) || name.trim().length < 2) throw new AppError('Name must be at least 2 characters.', 400);
  if (!isEmail(email)) throw new AppError('Please enter a valid email address.', 400);
  if (typeof password !== 'string' || password.length < 6) throw new AppError('Password must be at least 6 characters.', 400);

  const cleanEmail = email.trim().toLowerCase();
  if (await User.findByEmail(cleanEmail)) throw new AppError('An account with this email already exists.', 400);

  const hashed = await bcrypt.hash(password, 10); // never store the plain password
  const id = await User.create({ name: name.trim(), email: cleanEmail, password: hashed }); // role = 'user'
  const user = await User.findById(id);

  res.status(201).json({ user, token: generateToken(user.id) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!isEmail(email) || typeof password !== 'string' || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const found = await User.findByEmail(email.trim().toLowerCase());
  // Same message for "no user" and "wrong password" so attackers can't guess which emails exist
  if (!found || !(await bcrypt.compare(password, found.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = await User.findById(found.id);
  res.json({ user, token: generateToken(user.id) });
});

// GET /api/auth/me  (protected)
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
