// ShopCore API | index.js
// Role: starts the server. Loads .env, connects to MongoDB, then listens on the port.
// Owner: Ahile Shagba Francis (AH3)

// Must be the first import so .env is loaded before any other file reads process.env
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB(); // do not accept requests until the database is connected
  // Express 5 passes a startup error (for example "port already in use") to this callback
  app.listen(PORT, (err) => {
    if (err) {
      console.error(`Could not start on port ${PORT}: ${err.message}`);
      process.exit(1);
    }
    console.log(`ShopCore API running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1); // exit so Render or nodemon shows the failure clearly
});

// Last safety nets: log and stop instead of leaving the process in an unknown state
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
