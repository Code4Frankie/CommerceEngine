// ShopCore API | utils/asyncHandler.js
// Role: wraps an async controller so any error is passed to the central error handler.
// Owner: Abe Enoch (AB1)
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
