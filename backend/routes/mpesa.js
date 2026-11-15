const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const { recordMPesaDonation } = require('../utils/donationHandler');

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortcode: process.env.MPESA_BUSINESS_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox'
};

// Get M-Pesa access token (cached: Safaricom tokens last ~1 hour, and
// requesting a new one on every call trips Safaricom's firewall -> 403)
let cachedToken = null;
let cachedTokenExpiry = 0;

async function getMpesaAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  const key = (MPESA_CONFIG.consumerKey || '').trim();
  const secret = (MPESA_CONFIG.consumerSecret || '').trim();
  if (!key || !secret) throw new Error('M-Pesa credentials not configured');

  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = MPESA_CONFIG.environment === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          'User-Agent': 'Mozilla/5.0 (compatible; MwananchiDAO/1.0)',
          Accept: 'application/json'
        },
        timeout: 15000
      });
      const expiresIn = parseInt(response.data.expires_in, 10) || 3599;
      cachedToken = response.data.access_token;
      cachedTokenExpiry = Date.now() + (expiresIn - 120) * 1000;
      console.log('✅ M-Pesa access token obtained');
      return cachedToken;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      console.error(`⚠️ Token attempt ${attempt}/4 failed:`, error.code || error.message, status || '');
      // 400/401 = wrong credentials, no point retrying. 403/5xx/network = firewall or outage, retry.
      if (status === 400 || status === 401) break;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  throw lastError;
}

// Test endpoint to verify credentials are set
router.get('/test-credentials', (req, res) => {
  console.log('🧪 Testing M-Pesa credentials...');
  const hasKey = !!MPESA_CONFIG.consumerKey;
  const hasSecret = !!MPESA_CONFIG.consumerSecret;
  const hasShortcode = !!MPESA_CONFIG.businessShortcode;
  const hasPasskey = !!MPESA_CONFIG.passkey;

  res.json({
    environment: MPESA_CONFIG.environment,
    hasConsumerKey: hasKey,
    hasConsumerSecret: hasSecret,
    hasBusinessShortcode: hasShortcode,
    hasPasskey: hasPasskey,
    consumerKeyLength: MPESA_CONFIG.consumerKey?.length || 0,
    consumerSecretLength: MPESA_CONFIG.consumerSecret?.length || 0,
    businessShortcode: MPESA_CONFIG.businessShortcode,
    allSet: hasKey && hasSecret && hasShortcode && hasPasskey
  });
});

// Test endpoint to check if we can reach Safaricom
router.get('/test-safaricom', async (req, res) => {
  console.log('🧪 Testing Safaricom connectivity...');
  try {
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    console.log('📡 Testing connection to:', url);

    // Try a simple HEAD request first
    const headResponse = await axios.head(url, {
      timeout: 5000
    });

    console.log('✅ HEAD request successful');
    res.json({
      status: 'success',
      message: 'Can reach Safaricom',
      statusCode: headResponse.status
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('   Status:', error.response?.status);
    console.error('   Headers:', error.response?.headers);

    res.json({
      status: 'error',
      message: 'Cannot reach Safaricom',
      error: error.message,
      statusCode: error.response?.status,
      headers: error.response?.headers
    });
  }
});

// STK Push endpoint - Initiates M-Pesa payment prompt
router.post('/stk-push', async (req, res) => {
  try {
    console.log('📱 STK Push request received');
    const { phoneNumber, amount, accountReference, description } = req.body;

    if (!phoneNumber || !amount) {
      console.error('❌ Missing required fields:', { phoneNumber, amount });
      return res.status(400).json({
        error: 'Phone number and amount are required'
      });
    }

    console.log('📝 Request data:', { phoneNumber, amount });

    // Validate phone number (Kenya format)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('254')
      ? cleanPhone
      : '254' + cleanPhone.slice(-9);

    console.log('📞 Formatted phone:', formattedPhone);

    // Check if BACKEND_URL is set
    if (!process.env.BACKEND_URL) {
      console.error('❌ BACKEND_URL not set in environment');
      return res.status(500).json({
        error: 'Server configuration error: BACKEND_URL not set',
        details: 'Backend URL is not configured'
      });
    }

    console.log('🔐 Getting M-Pesa access token...');
    const accessToken = await getMpesaAccessToken();
    console.log('✅ Access token obtained');

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

    const password = Buffer.from(
      `${MPESA_CONFIG.businessShortcode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');

    const url = MPESA_CONFIG.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    console.log('📤 Sending STK Push to M-Pesa...');
    console.log('🔗 Callback URL: ' + process.env.BACKEND_URL + '/api/mpesa/callback (token hidden)');
    const requestPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL}/api/mpesa/callback?token=${encodeURIComponent(process.env.MPESA_CALLBACK_SECRET || '')}`,      AccountReference: accountReference || 'Charity-Donation',
      TransactionDesc: description || 'Donation to Charity DAO'
    };

    // Safaricom's sandbox often drops connections ("socket hang up"),
    // so retry a few times with a timeout before giving up.
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`📡 STK Push attempt ${attempt}/3`);
        response = await axios.post(url, requestPayload, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 20000
        });
        break;
      } catch (err) {
        const retryable = !err.response || err.response.status >= 500;
        console.error(`⚠️ Attempt ${attempt} failed:`, err.code || err.message, err.response?.status || '');
        if (!retryable || attempt === 3) throw err;
        await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }

    console.log('✅ STK Push sent successfully');
    console.log('📊 M-Pesa Response:', response.data);

    res.json({
      success: true,
      message: 'STK Push sent successfully',
      data: response.data
    });

  } catch (error) {
    console.error('❌ STK Push error:', error.message);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    console.error('❌ Full error:', error.response?.data || error);

    // Log detailed error info
    if (error.response?.status === 400) {
      console.error('⚠️ 400 Bad Request from M-Pesa');
      console.error('   Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Headers:', error.response?.headers);
    }

    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.message,
      mpesaError: error.response?.data,
      status: error.response?.status
    });
  }
});

// Results received from Safaricom's callback, keyed by CheckoutRequestID.
// The frontend polls /query-status; we answer from here first so we do not
// hammer Safaricom (which rate-limits with 429 / dropped connections).
const paymentResults = new Map();   // checkoutRequestId -> { ResultCode, ResultDesc }
const lastQueryAt = new Map();      // checkoutRequestId -> timestamp of last Safaricom query
const STILL_PENDING = { ResultCode: '1032', ResultDesc: 'Payment still being processed' };

router.post('/callback', async (req, res) => {
  try {
        const expectedToken = process.env.MPESA_CALLBACK_SECRET;
    if (!expectedToken || req.query.token !== expectedToken) {
      console.warn('⚠️ Callback rejected: bad or missing token');
      return res.status(403).json({ ResultCode: 1, ResultDesc: 'Forbidden' });
    }

    const { Body } = req.body;

    console.log('M-Pesa Callback received:', JSON.stringify(Body, null, 2));

    // Acknowledge receipt immediately
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    // Remember the outcome so /query-status can answer without calling Safaricom
    if (Body && Body.stkCallback && Body.stkCallback.CheckoutRequestID) {
      paymentResults.set(Body.stkCallback.CheckoutRequestID, {
        ResultCode: String(Body.stkCallback.ResultCode),
        ResultDesc: Body.stkCallback.ResultDesc || ''
      });
    }

    // Process callback asynchronously
    if (Body.stkCallback.ResultCode === 0) {
      const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
      const paymentData = {};
      callbackMetadata.forEach(item => {
        paymentData[item.Name] = item.Value;
      });

      console.log('✅ Payment successful:', paymentData);

      const amount = paymentData.Amount;
      const mpesaReceiptNumber = paymentData.MpesaReceiptNumber;
      const transactionDate = paymentData.TransactionDate;
      const phoneNumber = paymentData.PhoneNumber;

      try {
        const donation = await recordMPesaDonation({
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          transactionDate,
          checkoutRequestId: Body.stkCallback.CheckoutRequestID

        });
        console.log('✅ Donation recorded successfully:', donation);
      } catch (recordError) {
        console.error('❌ Error recording donation:', recordError);
      }
    } else {
      console.log('❌ Payment failed or cancelled:', Body.stkCallback.ResultCode);
      console.log('Payment failure reason:', Body.stkCallback.ResultDesc || 'Payment failed');
    }

  } catch (error) {
    console.error('Callback processing error:', error);
    if (!res.headersSent) res.json({ ResultCode: 1, ResultDesc: 'Error' });
  }
});

// Query transaction status
router.post('/query-status', async (req, res) => {
  const { checkoutRequestId } = req.body || {};
  if (!checkoutRequestId) {
    return res.status(400).json({ error: 'Checkout request ID is required' });
  }

  // 1. Callback already told us the outcome
  if (paymentResults.has(checkoutRequestId)) {
    return res.json(paymentResults.get(checkoutRequestId));
  }

  // 2. Do not ask Safaricom more than once every 10s per payment
  const now = Date.now();
  if (now - (lastQueryAt.get(checkoutRequestId) || 0) < 10000) {
    return res.json(STILL_PENDING);
  }
  lastQueryAt.set(checkoutRequestId, now);

  try {
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${MPESA_CONFIG.businessShortcode}${MPESA_CONFIG.passkey}${timestamp}`
    ).toString('base64');

    const url = MPESA_CONFIG.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query';

    const response = await axios.post(url, {
      BusinessShortCode: MPESA_CONFIG.businessShortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000
    });

    const data = response.data;
    if (data.ResultCode !== undefined) {
      data.ResultCode = String(data.ResultCode);
      if (data.ResultCode !== '1032') paymentResults.set(checkoutRequestId, data);
    }
    return res.json(data);
  } catch (error) {
    // Rate limits, dropped connections and "still processing" errors are
    // temporary: tell the form to keep waiting rather than showing a failure.
    console.error('Query status (will retry):', error.code || error.message, error.response?.status || '');
    return res.json(STILL_PENDING);
  }
});

module.exports = router;
