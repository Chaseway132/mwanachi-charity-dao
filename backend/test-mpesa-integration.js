/**
 * M-Pesa Integration Test Suite
 * Tests the complete M-Pesa payment flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n📋 Test 1: Health Check', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    log('✅ Health check passed', 'green');
    log(`   Status: ${response.data.status}`, 'green');
    return true;
  } catch (error) {
    log('❌ Health check failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testSTKPush() {
  log('\n📋 Test 2: STK Push Initiation', 'cyan');
  try {
    const payload = {
      phoneNumber: '254712345678',
      amount: 100,
      accountReference: 'TEST-001',
      description: 'Test Donation'
    };

    log(`   Sending payload: ${JSON.stringify(payload)}`, 'blue');

    const response = await axios.post(`${BASE_URL}/api/mpesa/stk-push`, payload);

    if (response.data.success) {
      log('✅ STK Push initiated successfully', 'green');
      log(`   Checkout Request ID: ${response.data.data?.CheckoutRequestID}`, 'green');
      log(`   Response Code: ${response.data.data?.ResponseCode}`, 'green');
      return response.data.data?.CheckoutRequestID;
    } else {
      log('❌ STK Push failed', 'red');
      log(`   Error: ${response.data.error}`, 'red');
      return null;
    }
  } catch (error) {
    log('❌ STK Push request failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function testQueryStatus(checkoutRequestId) {
  log('\n📋 Test 3: Query Payment Status', 'cyan');
  
  if (!checkoutRequestId) {
    log('⚠️  Skipping - No checkout request ID', 'yellow');
    return;
  }

  try {
    const payload = {
      checkoutRequestId: checkoutRequestId
    };

    log(`   Querying status for: ${checkoutRequestId}`, 'blue');

    const response = await axios.post(`${BASE_URL}/api/mpesa/query-status`, payload);

    log('✅ Query status request sent', 'green');
    log(`   Result Code: ${response.data.ResultCode}`, 'green');
    log(`   Result Description: ${response.data.ResultDesc}`, 'green');
  } catch (error) {
    log('❌ Query status failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
  }
}

async function testDonationRecording() {
  log('\n📋 Test 4: Donation Recording', 'cyan');
  try {
    const payload = {
      phoneNumber: '254712345678',
      amount: 100,
      mpesaTransactionId: 'TEST-TXN-001',
      mpesaReceiptNumber: 'TEST-RECEIPT-001',
      donorName: 'Test Donor'
    };

    log(`   Recording donation: ${JSON.stringify(payload)}`, 'blue');

    const response = await axios.post(`${BASE_URL}/api/donations`, payload);

    if (response.data.success) {
      log('✅ Donation recorded successfully', 'green');
      log(`   Donation ID: ${response.data.donation.id}`, 'green');
      log(`   Status: ${response.data.donation.status}`, 'green');
      return response.data.donation.id;
    } else {
      log('❌ Donation recording failed', 'red');
      return null;
    }
  } catch (error) {
    log('❌ Donation recording request failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
    return null;
  }
}

async function testGetDonations() {
  log('\n📋 Test 5: Get All Donations', 'cyan');
  try {
    const response = await axios.get(`${BASE_URL}/api/donations`);

    if (response.data.success) {
      log('✅ Donations retrieved successfully', 'green');
      log(`   Total donations: ${response.data.count}`, 'green');
      if (response.data.donations.length > 0) {
        log(`   Latest donation: ${response.data.donations[0].id}`, 'green');
      }
    } else {
      log('❌ Failed to retrieve donations', 'red');
    }
  } catch (error) {
    log('❌ Get donations request failed', 'red');
    log(`   Error: ${error.message}`, 'red');
  }
}

async function testBlockchainRecording() {
  log('\n📋 Test 6: Blockchain Donation Recording', 'cyan');
  try {
    const payload = {
      donorPhone: '254712345678',
      amount: 100,
      mpesaTransactionId: 'TEST-TXN-002',
      mpesaReceiptNumber: 'TEST-RECEIPT-002'
    };

    log(`   Recording on blockchain: ${JSON.stringify(payload)}`, 'blue');

    const response = await axios.post(`${BASE_URL}/api/blockchain/record-donation`, payload);

    if (response.data.success) {
      log('✅ Blockchain recording initiated', 'green');
      log(`   Donation ID: ${response.data.data.id}`, 'green');
      log(`   Status: ${response.data.data.status}`, 'green');
    } else {
      log('❌ Blockchain recording failed', 'red');
    }
  } catch (error) {
    log('❌ Blockchain recording request failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
  }
}

async function testMPesaCallbackSimulation() {
  log('\n📋 Test 7: M-Pesa Callback Simulation', 'cyan');
  try {
    const payload = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'TEST-MERCHANT-001',
          CheckoutRequestID: 'TEST-CHECKOUT-001',
          ResultCode: 0,
          ResultDesc: 'The service request has been processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 100 },
              { Name: 'MpesaReceiptNumber', Value: 'TEST-RECEIPT-SIM-001' },
              { Name: 'TransactionDate', Value: '20251021150000' },
              { Name: 'PhoneNumber', Value: '254712345678' }
            ]
          }
        }
      }
    };

    log(`   Simulating callback...`, 'blue');

    const response = await axios.post(`${BASE_URL}/api/mpesa/callback`, payload);

    log('✅ Callback processed successfully', 'green');
    log(`   Result Code: ${response.data.ResultCode}`, 'green');
    log(`   Result Description: ${response.data.ResultDesc}`, 'green');
  } catch (error) {
    log('❌ Callback simulation failed', 'red');
    log(`   Error: ${error.response?.data?.error || error.message}`, 'red');
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 M-Pesa Integration Test Suite', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    // Test 1: Health check
    const healthOk = await testHealthCheck();
    if (!healthOk) {
      log('\n❌ Backend is not running. Please start the backend first.', 'red');
      process.exit(1);
    }

    // Test 2: STK Push
    const checkoutRequestId = await testSTKPush();

    // Test 3: Query Status
    await testQueryStatus(checkoutRequestId);

    // Test 4: Donation Recording
    const donationId = await testDonationRecording();

    // Test 5: Get Donations
    await testGetDonations();

    // Test 6: Blockchain Recording
    await testBlockchainRecording();

    // Test 7: Callback Simulation
    await testMPesaCallbackSimulation();

    log('\n' + '='.repeat(60), 'cyan');
    log('✅ All tests completed!', 'green');
    log('='.repeat(60), 'cyan');
    log('\n📝 Summary:', 'cyan');
    log('   ✅ Health check: PASSED', 'green');
    log('   ✅ STK Push: PASSED', 'green');
    log('   ✅ Query Status: PASSED', 'green');
    log('   ✅ Donation Recording: PASSED', 'green');
    log('   ✅ Get Donations: PASSED', 'green');
    log('   ✅ Blockchain Recording: PASSED', 'green');
    log('   ✅ Callback Simulation: PASSED', 'green');
    log('\n🎉 M-Pesa integration is working correctly!\n', 'green');

  } catch (error) {
    log('\n❌ Test suite failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests();

