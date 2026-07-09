const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not configured. Please set the environment variable and retry.');
    process.exit(1);
  }

  const maxRetries = Number(process.env.MONGO_CONNECT_RETRIES || 5);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });
      console.log(`Atlas Connected (attempt ${attempt})`);
      return;
    } catch (error) {
      console.error(`Atlas connection attempt ${attempt} failed:`, error.message || error);
      if (attempt < maxRetries) {
        const wait = Math.min(30000, 500 * Math.pow(2, attempt)); // exponential backoff up to 30s
        console.log(`Retrying in ${Math.round(wait/1000)}s... (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, wait));
      } else {
        console.error('Atlas connection failed after maximum retries. Please verify your MONGO_URI and network connectivity.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
