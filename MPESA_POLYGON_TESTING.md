# 🧪 M-Pesa & Polygon Testing Guide

## 📱 M-Pesa Integration Testing

### Current Status
✅ **M-Pesa Sandbox Credentials Configured**
- Consumer Key: ✅ Set
- Consumer Secret: ✅ Set
- Business Shortcode: 174379
- Passkey: ✅ Set
- Environment: **SANDBOX** (for testing)

### Test M-Pesa STK Push

```bash
curl -X POST https://your-render-url/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "TEST-001",
    "description": "Test Donation"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "CheckoutRequestID": "ws_CO_DMZ_...",
    "ResponseCode": "0",
    "ResponseDescription": "Success"
  }
}
```

### Test M-Pesa Callback

```bash
curl -X POST https://your-render-url/api/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "TEST-MERCHANT-001",
        "CheckoutRequestID": "TEST-CHECKOUT-001",
        "ResultCode": 0,
        "ResultDesc": "The service request has been processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 100},
            {"Name": "MpesaReceiptNumber", "Value": "TEST-RECEIPT-001"},
            {"Name": "TransactionDate", "Value": "20251023150000"},
            {"Name": "PhoneNumber", "Value": "254712345678"}
          ]
        }
      }
    }
  }'
```

### Test M-Pesa Query Status

```bash
curl -X POST https://your-render-url/api/mpesa/query-status \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutRequestId": "ws_CO_DMZ_..."
  }'
```

---

## 🔗 Polygon Blockchain Testing

### Current Status
✅ **Polygon Configuration Ready**
- RPC URL: https://polygon-rpc.com
- Network: Polygon Mainnet
- Smart Contracts: Deployed

### Test Blockchain Donation Recording

```bash
curl -X POST https://your-render-url/api/blockchain/record-donation \
  -H "Content-Type: application/json" \
  -d '{
    "donorPhone": "254712345678",
    "amount": 100,
    "mpesaTransactionId": "TEST-TXN-001",
    "mpesaReceiptNumber": "TEST-RECEIPT-001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "donation_1729516800000",
    "status": "pending",
    "transactionHash": "0x..."
  }
}
```

### Test Blockchain Proposal Creation

```bash
curl -X POST https://your-render-url/api/blockchain/create-proposal \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Water Well",
    "description": "Water well for 500 families",
    "amountRequested": 5000,
    "recipientAddress": "0x06A8ee55E0846F5b8A5CdEeA925FCfecB6504ac3"
  }'
```

### Test Transaction Status

```bash
curl https://your-render-url/api/blockchain/tx-status/0x123abc...
```

---

## 🧪 Complete Testing Flow

### 1. M-Pesa Payment Flow

```
User enters phone & amount
    ↓
Frontend calls STK Push
    ↓
M-Pesa sends prompt to phone
    ↓
User enters PIN
    ↓
M-Pesa processes payment
    ↓
M-Pesa sends callback to backend
    ↓
Backend records donation
    ↓
Backend records on blockchain
    ↓
Frontend shows confirmation
```

### 2. Test Sequence

**Step 1: Initiate STK Push**
```bash
node backend/test-mpesa-integration.js
```

**Step 2: Simulate Callback**
- Backend receives callback from M-Pesa
- Records donation in database
- Records on blockchain

**Step 3: Verify Recording**
```bash
curl https://your-render-url/api/donations
```

---

## 📊 Testing Checklist

### M-Pesa Tests
- [ ] STK Push initiates successfully
- [ ] Callback is received and processed
- [ ] Donation is recorded in database
- [ ] Query status returns correct info
- [ ] Error handling works

### Polygon Tests
- [ ] Donation recorded on blockchain
- [ ] Proposal created on blockchain
- [ ] Transaction status can be queried
- [ ] Gas fees are calculated
- [ ] Error handling works

### Integration Tests
- [ ] M-Pesa → Database → Blockchain flow works
- [ ] Frontend receives confirmation
- [ ] Analytics are tracked
- [ ] Comments can be created
- [ ] All data persists

---

## 🔐 Security Considerations

### M-Pesa
- ✅ Using sandbox credentials (safe for testing)
- ✅ Callback URL is configured
- ✅ Credentials stored in environment variables
- ⚠️ Switch to production credentials when ready

### Polygon
- ✅ Using public RPC endpoint
- ✅ Private key stored in environment variables
- ✅ Contract addresses verified
- ⚠️ Ensure wallet has enough gas

### Backend
- ✅ CORS enabled
- ✅ Input validation implemented
- ✅ Error handling in place
- ⚠️ Add rate limiting for production

---

## 🚀 Production Readiness

### Before Going Live

**M-Pesa:**
- [ ] Switch to production credentials
- [ ] Update callback URL to production
- [ ] Test with real payments
- [ ] Set up monitoring

**Polygon:**
- [ ] Verify contract addresses
- [ ] Test with real transactions
- [ ] Monitor gas prices
- [ ] Set up alerts

**Backend:**
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Set up monitoring
- [ ] Configure backups

---

## 📝 Test Results Template

```
Date: 2025-10-23
Backend URL: https://your-render-url

M-Pesa Tests:
✅ STK Push: PASSED
✅ Callback: PASSED
✅ Query Status: PASSED
✅ Donation Recording: PASSED

Polygon Tests:
✅ Donation Recording: PASSED
✅ Proposal Creation: PASSED
✅ Transaction Status: PASSED

Integration Tests:
✅ M-Pesa → Blockchain: PASSED
✅ Frontend Integration: PASSED
✅ Analytics Tracking: PASSED

Overall Status: ✅ ALL TESTS PASSED
```

---

## 🎯 Next Steps

1. **Provide Render URL** - Share your backend URL
2. **Run Tests** - Execute test scripts
3. **Review Results** - Check test output
4. **Fix Issues** - Address any failures
5. **Deploy to Production** - When ready

**Ready to test?** Provide your Render URL! 🚀

