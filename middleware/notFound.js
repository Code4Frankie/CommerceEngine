// ShopCore API | middleware/notFound.js
// Role: answers 404 for any route that does not exist.
// Owner: Abe Enoch (AB1)
import ApiError from '../utils/ApiError.js';

const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

export default notFound;
