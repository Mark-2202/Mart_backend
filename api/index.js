require('dotenv').config();
const mongoose = require('mongoose');
const app = require('../src/app');

// Vercel caches global variables between warm invocations
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log('Using cached database connection');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log('Using existing mongoose connection');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${db.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error; // Let the request fail so it doesn't hang
  }
};

// Vercel serverless function entry point
module.exports = async (req, res) => {
  // Ensure DB is connected before processing the request
  await connectToDatabase();
  
  // Forward the request and response objects to Express
  return app(req, res);
};
