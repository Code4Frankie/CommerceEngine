// IMPORT: loads the Express library (the web framework) so we can build the server
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiLimiter } from './middleware/rateLimiter.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';


// CREATE: makes our application object. "app" is the ShopCore API itself
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
}));
// MIDDLEWARE: lets the app read JSON sent in request bodies (needed for register, login, products)
app.use(express.json());
app.use(notFound);
app.use(errorHandler);
// ROUTE: handles GET requests to /api/v1/health. "req" is the incoming request, "res" is our reply
app.get('/api/v1/health', (req, res) => {
  // RESPONSE: sends back JSON so we can confirm the API is alive
  res.json({ status: 'ok', name: 'ShopCore API' });
}); // end of the health route

const openapi = JSON.parse(fs.readFileSync(new URL('./docs/openapi.json', import.meta.url), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
// EXPORT: shares "app" with other files, so index.js can start it (and tests can use it)
export default app;
