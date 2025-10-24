const express = require('express');
const cors = require('cors');

// Load environment variables FIRST
require('dotenv').config();

// Log startup immediately
console.log('🚀 [STARTUP] Starting server...');
console.log('🚀 [STARTUP] Node version:', process.version);
console.log('🚀 [STARTUP] Environment:', process.env.NODE_ENV || 'development');

// Create app immediately
const app = express();

// Add basic middleware FIRST
console.log('🚀 [STARTUP] Adding middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// Health check FIRST (before any other routes)
console.log('🚀 [STARTUP] Registering health check...');
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// Test route
console.log('🚀 [STARTUP] Registering test route...');
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Now try to load MongoDB connection (non-blocking)
console.log('🚀 [STARTUP] Loading database connection...');
let connectDB;
try {
  connectDB = require('./utils/database').connectDB;
  connectDB().then(() => {
    console.log('✅ MongoDB connection initialized');
  }).catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    console.warn('⚠️ Continuing with in-memory storage...');
  });
} catch (error) {
  console.error('❌ Error loading database module:', error.message);
  console.warn('⚠️ Continuing without MongoDB...');
}

// Admin authentication routes
console.log('🚀 [STARTUP] Loading adminAuth middleware...');
let adminLogin, adminLoginSimple, checkAdminToken;
try {
  const adminAuth = require('./middleware/adminAuth');
  adminLogin = adminAuth.adminLogin;
  adminLoginSimple = adminAuth.adminLoginSimple;
  checkAdminToken = adminAuth.checkAdminToken;
  console.log('✅ adminAuth loaded successfully');
} catch (error) {
  console.error('❌ Error loading adminAuth:', error.message);
  console.error('❌ Stack:', error.stack);
  // Don't exit - continue without admin auth
  adminLogin = (req, res) => res.status(500).json({ error: 'Admin auth not available' });
  adminLoginSimple = (req, res) => res.status(500).json({ error: 'Admin auth not available' });
  checkAdminToken = (req, res, next) => res.status(500).json({ error: 'Admin auth not available' });
}

// Register admin routes
console.log('🚀 [STARTUP] Registering admin routes...');
app.post('/api/admin/login', adminLogin);
console.log('✅ Registered POST /api/admin/login');

app.post('/api/admin/login-simple', adminLoginSimple);
console.log('✅ Registered POST /api/admin/login-simple');

// Analytics data (in-memory for now, replace with database later)
let analyticsData = {
  totalVisits: 0,
  uniqueVisitors: new Set(),
  campaignsCreated: 0,
  totalDonations: 0,
  lastVisit: new Date().toLocaleString()
};

// Analytics endpoint
app.get('/api/analytics', checkAdminToken, (req, res) => {
  res.json({
    totalVisits: analyticsData.totalVisits,
    uniqueVisitors: analyticsData.uniqueVisitors.size,
    campaignsCreated: analyticsData.campaignsCreated,
    totalDonations: analyticsData.totalDonations,
    lastVisit: analyticsData.lastVisit
  });
});

// Track visits (called from frontend)
app.post('/api/analytics/track', (req, res) => {
  try {
    const { visitorId } = req.body;
    analyticsData.totalVisits++;
    if (visitorId) {
      analyticsData.uniqueVisitors.add(visitorId);
    }
    analyticsData.lastVisit = new Date().toLocaleString();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export analytics data for campaign creation tracking
global.analyticsData = analyticsData;

// Register routes with error handling
console.log('🚀 [STARTUP] Registering API routes...');
try {
  app.use('/api/mpesa', require('./routes/mpesa'));
  console.log('✅ Registered /api/mpesa');
} catch (error) {
  console.error('❌ Error loading mpesa routes:', error.message);
}

try {
  app.use('/api/donations', require('./routes/donations'));
  console.log('✅ Registered /api/donations');
} catch (error) {
  console.error('❌ Error loading donations routes:', error.message);
}

try {
  app.use('/api/proposals', require('./routes/proposals'));
  console.log('✅ Registered /api/proposals');
} catch (error) {
  console.error('❌ Error loading proposals routes:', error.message);
}

try {
  app.use('/api/comments', require('./routes/comments'));
  console.log('✅ Registered /api/comments');
} catch (error) {
  console.error('❌ Error loading comments routes:', error.message);
}

try {
  app.use('/api/blockchain', require('./routes/blockchain'));
  console.log('✅ Registered /api/blockchain');
} catch (error) {
  console.error('❌ Error loading blockchain routes:', error.message);
}

try {
  app.use('/api/special-donations', require('./routes/special-donations'));
  console.log('✅ Registered /api/special-donations');
} catch (error) {
  console.error('❌ Error loading special-donations routes:', error.message);
}

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path} not found`);
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('❌ Stack:', err.stack);
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date()
  });
});

// Start server with error handling
const PORT = process.env.PORT || 5000;
console.log('🚀 [STARTUP] Starting server on port', PORT);

const server = app.listen(PORT, () => {
  console.log('✅ [STARTUP] Backend server running on port', PORT);
  console.log('✅ [STARTUP] Health check: http://localhost:' + PORT + '/health');
  console.log('✅ [STARTUP] M-Pesa endpoint: http://localhost:' + PORT + '/api/mpesa/stk-push');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ [SERVER ERROR]', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error('❌ Port', PORT, 'is already in use');
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', err.message);
  console.error('❌ Stack:', err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
});

