import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`ShopCore API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start ShopCore API:", error.message);
    process.exit(1);
  }
}

startServer();