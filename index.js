// IMPORT: loads variables from the .env file into process.env (must come first)
import 'dotenv/config';
// IMPORT: Mongoose is the library that talks to MongoDB
import mongoose from 'mongoose';
// IMPORT: brings in the app we built and exported in app.js
import app from './app.js';
import dns from 'node:dns';
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(','));
}
// PORT: the door the server listens on. Uses the PORT from the environment (Render sets one), otherwise 5001
const PORT = process.env.PORT || 5001;

// START: connect to the database first, then begin listening for requests
async function start() {
  try {
    // CONNECT: opens the connection using the connection string stored in .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`ShopCore API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    // FAIL: if the DB can't be reached, show why and stop instead of running half-broken
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
