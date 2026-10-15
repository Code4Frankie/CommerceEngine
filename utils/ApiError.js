// ShopCore API | utils/ApiError.js
// Role: an error that carries an HTTP status code. Throw it anywhere: throw new ApiError(404, 'Not found')
// Owner: Abe Enoch (AB1)
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
