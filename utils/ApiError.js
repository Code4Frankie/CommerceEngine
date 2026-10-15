// ShopCore API | utils/ApiError.js
// Role: an error that carries an HTTP status code. Throw it anywhere: throw new ApiError(404, 'Not found')
// Owner: Abe Enoch (AB1)
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
