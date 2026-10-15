// ShopCore API | middleware/rateLimiter.js
// Role: limits how often one IP can call the API. authLimiter is stricter, for login and register.
// Owner: Abe Enoch (AB1)
import rateLimit from 'express-rate-limit';

const make = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
    skip: () => process.env.NODE_ENV === 'test', // do not block automated tests
  });

export const apiLimiter = make(300);
export const authLimiter = make(20);
