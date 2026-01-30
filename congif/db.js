import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    
    // Remove ALL deprecated options, use modern connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Keep only these modern options
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10, // Connection pool size
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('querySrv ESERVFAIL')) {
      console.log("\n⚠️  DNS Resolution Issue Detected!");
      console.log("Quick fix: Use non-SRV connection string in .env");
      console.log("Run this command:");
      console.log("echo 'MONGO_URI=mongodb://dhananjaybansal28:Djbansal1234@cluster0-shard-00-00.udxisga.mongodb.net:27017/test?ssl=true&authSource=admin' > .env");
    }
    
    if (error.message.includes('authentication failed')) {
      console.log("\n⚠️  Authentication Failed!");
      console.log("1. Check password in MongoDB Atlas");
      console.log("2. Go to: Security → Database Access → Edit user");
    }
    
    if (error.message.includes('network error')) {
      console.log("\n⚠️  Network Issue!");
      console.log("1. Check IP whitelist in MongoDB Atlas");
      console.log("2. Run: sudo ufw allow out 27017");
    }
    
    process.exit(1);
  }
};

export default connectDB;