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

// Get M-Pesa access token
async function getMpesaAccessToken() {
  try {
    console.log('🔐 M-Pesa Config:', {
      environment: MPESA_CONFIG.environment,
      hasConsumerKey: !!MPESA_CONFIG.consumerKey,
      hasConsumerSecret: !!MPESA_CONFIG.consumerSecret,
      businessShortcode: MPESA_CONFIG.businessShortcode,
      consumerKeyLength: MPESA_CONFIG.consumerKey?.length || 0,
      consumerSecretLength: MPESA_CONFIG.consumerSecret?.length || 0
    });

    // Log the actual credentials (first and last few chars only for security)
    if (MPESA_CONFIG.consumerKey) {
      const key = MPESA_CONFIG.consumerKey;
      console.log('🔑 Consumer Key:', key.substring(0, 5) + '...' + key.substring(key.length - 5));
    }
    if (MPESA_CONFIG.consumerSecret) {
      const secret = MPESA_CONFIG.consumerSecret;
      console.log('🔑 Consumer Secret:', secret.substring(0, 5) + '...' + secret.substring(secret.length - 5));
    }

    if (!MPESA_CONFIG.consumerKey || !MPESA_CONFIG.consumerSecret) {
      console.error('❌ Missing credentials:');
      console.error('   MPESA_CONSUMER_KEY:', process.env.MPESA_CONSUMER_KEY ? 'SET' : 'NOT SET');
      console.error('   MPESA_CONSUMER_SECRET:', process.env.MPESA_CONSUMER_SECRET ? 'SET' : 'NOT SET');
      throw new Error('M-Pesa credentials not configured');
    }

    const credString = `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`;
    console.log('🔑 Credential string length:', credString.length);
    console.log('🔑 First 20 chars of key:', MPESA_CONFIG.consumerKey.substring(0, 20));

    const auth = Buffer.from(credString).toString('base64');
    console.log('🔐 Base64 auth header length:', auth.length);
    console.log('🔐 First 20 chars of auth:', auth.substring(0, 20));

    const url = MPESA_CONFIG.environment === 'sandbox'
      ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    console.log('🔗 OAuth URL:', url);
    console.log('📤 Sending OAuth request...');

    console.log('📡 Making axios request to:', url);
    console.log('📡 Request headers:', {
      Authorization: `Basic ${auth.substring(0, 20)}...`
    });

    // Try without Content-Type header (some APIs don't like it on GET requests)
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      timeout: 10000
    });

    console.log('✅ Access token obtained successfully');
    console.log('📊 Token response:', {
      hasAccessToken: !!response.data.access_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error getting M-Pesa access token:', error.message);
    console.error('❌ Status code:', error.response?.status);
    console.error('❌ Status text:', error.response?.statusText);
    console.error('❌ Response headers:', error.response?.headers);
    console.error('❌ Response data:', error.response?.data);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error config URL:', error.config?.url);

    // More detailed error info
    if (error.response?.status === 400) {
      console.error('⚠️ 400 Bad Request - Possible causes:');
      console.error('   - Invalid credentials');
      console.error('   - Malformed request');
      console.error('   - Safaricom API issue');
      console.error('   - Sandbox credentials expired');
    }

    throw error;
  }
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
    console.log('🔗 Callback URL:', `${process.env.BACKEND_URL}/api/mpesa/callback`);

    const requestPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.BACKEND_URL}/api/mpesa/callback`,
      AccountReference: accountReference || 'Charity-Donation',
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

// M-Pesa Callback endpoint
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;

    console.log('M-Pesa Callback received:', JSON.stringify(Body, null, 2));

    // Acknowledge receipt immediately
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    // Process callback asynchronously
    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const callbackMetadata = Body.stkCallback.CallbackMetadata.Item;
      const paymentData = {};

      callbackMetadata.forEach(item => {
        paymentData[item.Name] = item.Value;
      });

      console.log('✅ Payment successful:', paymentData);

      // Extract payment details
      const amount = paymentData.Amount;
      const mpesaReceiptNumber = paymentData.MpesaReceiptNumber;
      const transactionDate = paymentData.TransactionDate;
      const phoneNumber = paymentData.PhoneNumber;

      // Record donation in backend and blockchain
      try {
        const donation = await recordMPesaDonation({
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          transactionDate
        });

        console.log('✅ Donation recorded successfully:', donation);

        // TODO: Send notification to frontend via WebSocket
        // TODO: Update frontend with donation confirmation
      } catch (recordError) {
        console.error('❌ Error recording donation:', recordError);
      }
    } else {
      console.log('❌ Payment failed or cancelled:', Body.stkCallback.ResultCode);
      // Handle failed payment
      const resultDesc = Body.stkCallback.ResultDesc || 'Payment failed';
      console.log('Payment failure reason:', resultDesc);
    }

  } catch (error) {
    console.error('Callback processing error:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Error' });
  }
});

// Query transaction status
router.post('/query-status', async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'Checkout request ID is required' });
    }

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    
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
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('Query status error:', error.message);
    res.status(500).json({ error: 'Failed to query status' });
  }
});

module.exports = router;

