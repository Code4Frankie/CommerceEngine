import { webcrypto } from 'node:crypto';
globalThis.crypto ??= webcrypto; // Injects the missing crypto global for Node 18

import 'dotenv/config'; // fetches secret credentials from the .env file
import app from './app.js'; 
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000; // Defines the port

// no request will be accepted until there is a secure connection with database
const start = async ()=> {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`🚀 ShopCore Engine is fully active at: http://localhost:${PORT}`);
      });
};

start().catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1); // exit so error can be displayed on the terminal
});


