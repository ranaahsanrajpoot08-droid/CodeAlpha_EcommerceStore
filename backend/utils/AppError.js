// An Error that carries an HTTP status code.
// Usage: throw new AppError('Not found', 404);
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = AppError;
