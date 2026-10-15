// ShopCore API | middleware/errorHandler.js
// Role: central error handler. Every error becomes { success: false, message } with the right status.
// Owner: Abe Enoch (AB1)
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {}).join(', ')} already exists`;
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (maximum 5 MB)' : err.message;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON in the request body';
  }

  if (status >= 500) console.error(err); // only real server faults are logged
  const production = process.env.NODE_ENV === 'production';
  res.status(status).json({
    success: false,
    message: status >= 500 && production ? 'Server error' : message,
    ...(!production && status >= 500 && { stack: err.stack }),
  });
};

export default errorHandler;
