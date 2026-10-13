// IMPORT: loads the Express library (the web framework) so we can build the server
import express from 'express';
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

// CREATE: makes our application object. "app" is the ShopCore API itself
const app = express();

// MIDDLEWARE: lets the app read JSON sent in request bodies (needed for register, login, products)
app.use(express.json());
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);

// ROUTE: handles GET requests to /api/v1/health. "req" is the incoming request, "res" is our reply
app.get('/api/v1/health', (req, res) => {
  // RESPONSE: sends back JSON so we can confirm the API is alive
  res.json({ status: 'ok', name: 'ShopCore API' });
}); // end of the health route

// EXPORT: shares "app" with other files, so index.js can start it (and tests can use it)
export default app;