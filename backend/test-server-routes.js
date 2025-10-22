// Test if routes are registered in server.js
const app = require('./server');

console.log('Checking routes in server.js...');

// Wait a moment for server to start
setTimeout(() => {
  if (app._router && app._router.stack) {
    console.log('Routes found:');
    app._router.stack.forEach((middleware, index) => {
      if (middleware.route) {
        console.log(`${index}: ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        console.log(`${index}: Router middleware`);
      } else if (middleware.name) {
        console.log(`${index}: ${middleware.name}`);
      }
    });
  } else {
    console.log('No routes found');
  }
  process.exit(0);
}, 1000);

