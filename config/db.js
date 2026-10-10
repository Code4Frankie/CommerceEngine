import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully");
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

export default connectDB;
