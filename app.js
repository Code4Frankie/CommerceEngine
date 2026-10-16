// ShopCore API | app.js
// Role: builds the Express app: security, body parsing, routes and error handling.
// index.js starts it; tests import it directly.
// Owner: Ahile Shagba Francis (AH3) | security wiring: Abe Enoch (AB2)

import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ApiError from './utils/ApiError.js';
import sanitize from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { paymentWebhook } from './controllers/paymentController.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct IPs in rate limiting
// Swagger docs at /api-docs. Mounted before helmet() because helmet's default policy blocks Swagger's page script.
const openapi = JSON.parse(fs.readFileSync(new URL('./docs/openapi.json', import.meta.url), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(helmet()); // safe default security headers

// CORS: only the frontend origins listed in CLIENT_URLS may call the API from a browser.
// Requests with no origin (Postman, curl, server to server) are allowed.
const origins = (process.env.CLIENT_URLS || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(
  cors((req, cb) => {
    const origin = req.header('Origin');
    const sameOrigin = origin && origin === `${req.protocol}://${req.get('host')}`;
    if (!origin || sameOrigin || origins.includes(origin)) return cb(null, { origin: true, credentials: true });
    return cb(new ApiError(403, 'Origin not allowed by CORS'));
  })
);

if (!['production', 'test'].includes(process.env.NODE_ENV)) app.use(morgan('dev')); // request log

// The payment webhook needs the RAW body to check the gateway signature,
// so it is registered BEFORE express.json().
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentWebhook);

app.use(express.json({ limit: '1mb' })); // read JSON request bodies
app.use(sanitize); // strip MongoDB operator keys such as $gt from request bodies

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', name: 'ShopCore API' });
});

app.use('/api/v1', apiLimiter); // general rate limit for everything below

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFound); // unknown route -> 404
app.use(errorHandler); // every error ends up here

export default app;
