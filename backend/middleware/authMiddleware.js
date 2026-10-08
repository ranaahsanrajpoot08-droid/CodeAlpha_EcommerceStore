// Checks the "Authorization: Bearer <token>" header, verifies the JWT and
// attaches the logged-in user to req.user.
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new AppError('Not authorized. Please log in.', 401);

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired

  const user = await User.findById(decoded.id); // password is never selected
  if (!user) throw new AppError('User no longer exists.', 401);

  req.user = user;
  next();
});
