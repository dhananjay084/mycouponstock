import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  const retryDelayMs = Number.parseInt(process.env.MONGO_RETRY_DELAY_MS || '5000', 10);
  const maxRetries = Number.parseInt(process.env.MONGO_MAX_RETRIES || '0', 10); // 0 = infinite
  let attempt = 0;

  while (true) {
    try {
      attempt += 1;
      console.log(`🔌 Connecting to MongoDB Atlas... (attempt ${attempt})`);

      // Remove ALL deprecated options, use modern connection
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Keep only these modern options
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 10, // Connection pool size
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection error: ${error.message}`);

      // Provide specific troubleshooting based on error
      if (error.message.includes('querySrv ESERVFAIL') || error.message.includes('querySrv ECONNREFUSED')) {
        console.log("\n⚠️  DNS/SRV Resolution Issue Detected!");
        console.log("Quick fix: Use a non-SRV connection string in .env (mongodb://...)");
      }

      if (error.message.includes('authentication failed')) {
        console.log("\n⚠️  Authentication Failed!");
        console.log("1. Check password in MongoDB Atlas");
        console.log("2. Go to: Security → Database Access → Edit user");
      }

      if (error.message.includes('network error')) {
        console.log("\n⚠️  Network Issue!");
        console.log("1. Check IP whitelist in MongoDB Atlas");
        console.log("2. Ensure outbound 27017 is allowed");
      }

      if (maxRetries > 0 && attempt >= maxRetries) {
        throw error;
      }

      console.log(`⏳ Retrying MongoDB connection in ${retryDelayMs}ms...`);
      await sleep(retryDelayMs);
    }
  }
};

export default connectDB;
