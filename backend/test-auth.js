// Test if adminAuth module loads correctly
console.log('Testing adminAuth module...');

try {
  const auth = require('./middleware/adminAuth');
  console.log('✓ adminAuth loaded successfully');
  console.log('Exported functions:', Object.keys(auth));
  
  if (auth.adminLoginSimple) {
    console.log('✓ adminLoginSimple function found');
  } else {
    console.log('✗ adminLoginSimple function NOT found');
  }
} catch (error) {
  console.error('✗ Error loading adminAuth:', error.message);
  console.error(error.stack);
}

console.log('\nTesting server.js...');
try {
  require('./server');
  console.log('✓ server.js loaded successfully');
} catch (error) {
  console.error('✗ Error loading server.js:', error.message);
  console.error(error.stack);
}

