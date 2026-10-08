// 404 handler + central error handler.
const AppError = require('../utils/AppError');

exports.notFound = (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.code === 'ER_DUP_ENTRY') {
    status = 400;
    message = 'That value already exists (e.g. email already registered).';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 400;
    message = 'This item is used by existing orders and cannot be deleted. Set its stock to 0 instead.';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired or invalid. Please log in again.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in request body.';
  } else if (err.code === 'ECONNREFUSED' || err.code === 'ER_BAD_DB_ERROR' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    status = 500;
    message = 'Database connection problem. Check that MySQL is running in XAMPP and your .env is correct.';
    console.error(err.message);
  } else if (status === 500) {
    console.error(err);
    message = 'Something went wrong on the server.';
  }

  res.status(status).json({ message });
};
