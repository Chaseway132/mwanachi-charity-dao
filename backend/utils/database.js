const mongoose = require('mongoose');

// MongoDB connection string
// For development: Use MongoDB Atlas free tier
// For production: Use environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mwanachi-charity-dao';

// Connection options
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connect to MongoDB
async function connectDB() {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MONGODB_URI env var:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('📍 URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password

    await mongoose.connect(MONGODB_URI, connectionOptions);

    console.log('✅ MongoDB connected successfully');
    console.log('📊 Connection readyState:', mongoose.connection.readyState);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from MongoDB');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Make sure MongoDB is running or provide MONGODB_URI environment variable');

    // Don't exit, allow app to run with in-memory storage as fallback
    console.warn('⚠️ Falling back to in-memory storage');
    return null;
  }
}

// Disconnect from MongoDB
async function disconnectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

// Check if MongoDB is connected
function isConnected() {
  const connected = mongoose.connection.readyState === 1;
  console.log('🔍 isConnected() check - readyState:', mongoose.connection.readyState, '- connected:', connected);
  return connected;
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  mongoose
};

