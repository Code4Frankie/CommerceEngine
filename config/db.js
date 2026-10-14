import mongoose from 'mongoose';
import dns from 'node:dns';

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing. Add it to your .env file');
  // Some networks cannot resolve mongodb+srv addresses; DNS_SERVERS=8.8.8.8,1.1.1.1 fixes that
  if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

// This line handles the default export your index.js file is looking for!
export default connectDB;
