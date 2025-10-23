const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./utils/database');

const app = express();

// Connect to MongoDB on startup
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.warn('Continuing with in-memory storage...');
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug: Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Admin authentication routes
console.log('Loading adminAuth middleware...');
let adminLogin, adminLoginSimple, checkAdminToken;
try {
  const adminAuth = require('./middleware/adminAuth');
  adminLogin = adminAuth.adminLogin;
  adminLoginSimple = adminAuth.adminLoginSimple;
  checkAdminToken = adminAuth.checkAdminToken;
  console.log('✓ adminAuth loaded successfully');
  console.log('adminLoginSimple type:', typeof adminLoginSimple);
} catch (error) {
  console.error('✗ Error loading adminAuth:', error.message);
  process.exit(1);
}

console.log('Registering admin routes...');
app.post('/api/admin/login', adminLogin);
console.log('✓ Registered POST /api/admin/login');

app.post('/api/admin/login-simple', adminLoginSimple);
console.log('✓ Registered POST /api/admin/login-simple');

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

// Routes
app.use('/api/mpesa', require('./routes/mpesa'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/special-donations', require('./routes/special-donations'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path} not found`);
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

