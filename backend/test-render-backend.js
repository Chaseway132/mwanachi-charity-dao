/**
 * Test Render Backend Deployment
 * Run this to test your Render backend
 */

const axios = require('axios');

// ⚠️ UPDATE THIS WITH YOUR RENDER URL
const RENDER_URL = process.env.RENDER_URL || 'https://mwanachi-charity-dao-backend.onrender.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(70), 'cyan');
  log(`  ${title}`, 'cyan');
  log('='.repeat(70), 'cyan');
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    log(`\n▶ ${name}`, 'blue');
    await fn();
    log(`✅ PASSED`, 'green');
    passed++;
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    failed++;
    return false;
  }
}

async function runTests() {
  section(`🚀 TESTING RENDER BACKEND`);
  log(`\nBackend URL: ${RENDER_URL}`, 'magenta');

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await axios.get(`${RENDER_URL}/health`, { timeout: 10000 });
    if (!response.data.status) throw new Error('No status in response');
    log(`   Status: ${response.data.status}`, 'green');
  });

  // Test 2: Test Route
  await test('Test Route', async () => {
    const response = await axios.get(`${RENDER_URL}/api/test`, { timeout: 10000 });
    if (!response.data.message) throw new Error('No message in response');
    log(`   Message: ${response.data.message}`, 'green');
  });

  section('📡 DONATIONS API');

  // Test 3: Create Donation
  let donationId;
  await test('Create Donation', async () => {
    const payload = {
      phoneNumber: '254712345678',
      amount: 100,
      donorName: 'Test Donor',
      mpesaTransactionId: 'TEST-TXN-' + Date.now(),
      mpesaReceiptNumber: 'TEST-RECEIPT-' + Date.now()
    };
    const response = await axios.post(`${RENDER_URL}/api/donations`, payload, { timeout: 10000 });
    if (!response.data.success) throw new Error('Donation creation failed');
    donationId = response.data.donation.id;
    log(`   Donation ID: ${donationId}`, 'green');
  });

  // Test 4: Get All Donations
  await test('Get All Donations', async () => {
    const response = await axios.get(`${RENDER_URL}/api/donations`, { timeout: 10000 });
    if (!response.data.success) throw new Error('Failed to get donations');
    log(`   Total donations: ${response.data.count}`, 'green');
  });

  section('💬 COMMENTS API');

  // Test 5: Create Comment
  let commentId;
  await test('Create Comment', async () => {
    const payload = {
      proposalId: 'proposal_test_' + Date.now(),
      authorPhone: '254712345678',
      authorName: 'Test User',
      content: 'This is a test comment'
    };
    const response = await axios.post(`${RENDER_URL}/api/comments`, payload, { timeout: 10000 });
    if (!response.data.success) throw new Error('Comment creation failed');
    commentId = response.data.comment.id;
    log(`   Comment ID: ${commentId}`, 'green');
  });

  // Test 6: Get All Comments
  await test('Get All Comments', async () => {
    const response = await axios.get(`${RENDER_URL}/api/comments`, { timeout: 10000 });
    if (!response.data.success) throw new Error('Failed to get comments');
    log(`   Total comments: ${response.data.count}`, 'green');
  });

  section('📊 ANALYTICS API');

  // Test 7: Track Visit
  await test('Track Visit', async () => {
    const payload = {
      visitorId: 'visitor_' + Date.now()
    };
    const response = await axios.post(`${RENDER_URL}/api/analytics/track`, payload, { timeout: 10000 });
    if (!response.data.success) throw new Error('Failed to track visit');
    log(`   Visit tracked successfully`, 'green');
  });

  section('🔗 BLOCKCHAIN API');

  // Test 8: Record Donation on Blockchain
  await test('Record Donation on Blockchain', async () => {
    const payload = {
      donorPhone: '254712345678',
      amount: 100,
      mpesaTransactionId: 'TEST-BLOCKCHAIN-' + Date.now(),
      mpesaReceiptNumber: 'TEST-RECEIPT-BLOCKCHAIN-' + Date.now()
    };
    const response = await axios.post(`${RENDER_URL}/api/blockchain/record-donation`, payload, { timeout: 10000 });
    log(`   Response received`, 'green');
  });

  section('📋 TEST SUMMARY');
  log(`\n✅ Tests Completed!`, 'green');
  log(`   Total: ${passed + failed}`, 'cyan');
  log(`   Passed: ${passed}`, 'green');
  log(`   Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  
  if (failed === 0) {
    log(`\n🎉 All tests passed! Backend is working correctly!`, 'green');
    log(`\n📝 Next Steps:`, 'cyan');
    log(`   1. Update frontend with Render URL`, 'cyan');
    log(`   2. Test M-Pesa integration`, 'cyan');
    log(`   3. Test Polygon blockchain`, 'cyan');
  } else {
    log(`\n⚠️  Some tests failed. Check output above.`, 'yellow');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
log(`\n🔍 Connecting to Render backend...`, 'yellow');
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});

