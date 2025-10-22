// Test if routes are registered
const express = require('express');
const app = express();

app.use(express.json());

// Test route
app.post('/api/admin/login-simple', (req, res) => {
  res.json({ success: true, message: 'Route works!' });
});

// List all routes AFTER registering
console.log('Routes registered:');
if (app._router && app._router.stack) {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    }
  });
} else {
  console.log('No routes found');
}

// Test the route
console.log('\nTesting route...');
const testReq = { body: { username: 'admin', password: 'admin123' } };
const testRes = {
  json: (data) => console.log('Response:', data),
  status: (code) => ({ json: (data) => console.log(`Status ${code}:`, data) })
};
app._router.stack.find(m => m.route && m.route.path === '/api/admin/login-simple')?.route.stack[0].handle(testReq, testRes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});

