const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
console.log('Registering test routes...');

app.post('/api/admin/login-simple', (req, res) => {
  console.log('POST /api/admin/login-simple called');
  res.json({ success: true, message: 'Login successful', token: 'test-token' });
});
console.log('✓ Registered POST /api/admin/login-simple');

app.get('/health', (req, res) => {
  console.log('GET /health called');
  res.json({ status: 'Backend is running', timestamp: new Date() });
});
console.log('✓ Registered GET /health');

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path} not found`);
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

