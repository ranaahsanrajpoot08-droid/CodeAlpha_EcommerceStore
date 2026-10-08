// Must be used AFTER authMiddleware. Allows only users with role "admin".
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admins only.', 403));
  }
  next();
};
