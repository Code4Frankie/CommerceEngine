import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Activate HTTP Shield Headers via Helmet
app.use(helmet());

// HTTP Request Logger Framework Tracking 
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Mount Rate Limiter Security Gates
app.use('/api/', apiLimiter);

// Cross-Origin Resource Sharing (CORS) Setup
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));

// Incoming Content Parsing Configurations
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/orders/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Routing Declarations
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});


// global error Handler Boundary Checkpoint
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  return res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'An unhandled backend processing exception occurred.'
  });
});

export default app;
