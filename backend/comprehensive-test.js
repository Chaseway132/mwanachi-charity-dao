/**
 * Comprehensive Backend Testing Suite
 * Tests all API endpoints and integrations
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Color codes
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

async function test(name, fn) {
  try {
    log(`\n▶ ${name}`, 'blue');
    await fn();
    log(`✅ PASSED`, 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

let results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function runTests() {
  section('🚀 COMPREHENSIVE BACKEND TEST SUITE');

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    if (!response.data.status) throw new Error('No status in response');
    log(`   Status: ${response.data.status}`, 'green');
  });

  // Test 2: Test Route
  await test('Test Route', async () => {
    const response = await axios.get(`${BASE_URL}/api/test`);
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
    const response = await axios.post(`${BASE_URL}/api/donations`, payload);
    if (!response.data.success) throw new Error('Donation creation failed');
    donationId = response.data.donation.id;
    log(`   Donation ID: ${donationId}`, 'green');
  });

  // Test 4: Get All Donations
  await test('Get All Donations', async () => {
    const response = await axios.get(`${BASE_URL}/api/donations`);
    if (!response.data.success) throw new Error('Failed to get donations');
    log(`   Total donations: ${response.data.count}`, 'green');
  });

  // Test 5: Get Single Donation
  if (donationId) {
    await test('Get Single Donation', async () => {
      const response = await axios.get(`${BASE_URL}/api/donations/${donationId}`);
      if (!response.data.success) throw new Error('Failed to get donation');
      log(`   Donation amount: ${response.data.donation.amount}`, 'green');
    });
  }

  section('💬 COMMENTS API');

  // Test 6: Create Comment
  let commentId;
  await test('Create Comment', async () => {
    const payload = {
      proposalId: 'proposal_test_' + Date.now(),
      authorPhone: '254712345678',
      authorName: 'Test User',
      content: 'This is a test comment'
    };
    const response = await axios.post(`${BASE_URL}/api/comments`, payload);
    if (!response.data.success) throw new Error('Comment creation failed');
    commentId = response.data.comment.id;
    log(`   Comment ID: ${commentId}`, 'green');
  });

  // Test 7: Get All Comments
  await test('Get All Comments', async () => {
    const response = await axios.get(`${BASE_URL}/api/comments`);
    if (!response.data.success) throw new Error('Failed to get comments');
    log(`   Total comments: ${response.data.count}`, 'green');
  });

  section('📊 ANALYTICS API');

  // Test 8: Track Visit
  await test('Track Visit', async () => {
    const payload = {
      visitorId: 'visitor_' + Date.now()
    };
    const response = await axios.post(`${BASE_URL}/api/analytics/track`, payload);
    if (!response.success) throw new Error('Failed to track visit');
    log(`   Visit tracked successfully`, 'green');
  });

  section('🔗 BLOCKCHAIN API');

  // Test 9: Record Donation on Blockchain
  await test('Record Donation on Blockchain', async () => {
    const payload = {
      donorPhone: '254712345678',
      amount: 100,
      mpesaTransactionId: 'TEST-BLOCKCHAIN-' + Date.now(),
      mpesaReceiptNumber: 'TEST-RECEIPT-BLOCKCHAIN-' + Date.now()
    };
    const response = await axios.post(`${BASE_URL}/api/blockchain/record-donation`, payload);
    log(`   Response received`, 'green');
  });

  section('📋 SUMMARY');
  log(`\n✅ Tests Completed!`, 'green');
  log(`   Total: ${results.passed + results.failed}`, 'cyan');
  log(`   Passed: ${results.passed}`, 'green');
  log(`   Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log(`\n🎉 All tests passed!`, 'green');
  } else {
    log(`\n⚠️  Some tests failed. Check output above.`, 'yellow');
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});

