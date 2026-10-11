// app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api/', apiLimiter);
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/orders/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api/v1/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const code = err.statusCode || 500;
  res.status(code).json({ status: 'error', message: err.message || 'An internal backend processing breakdown occurred.' });
});

export default app;
