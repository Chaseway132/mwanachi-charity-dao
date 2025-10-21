# ✅ Phase 2: M-Pesa Integration - Checklist

## 🎯 Phase 2 Goal
Integrate M-Pesa STK Push so donors can pay with their phone without needing MetaMask or crypto knowledge.

---

## 📋 Pre-Integration Checklist

### Backend Status
- [x] Express server created
- [x] M-Pesa routes created
- [x] Donation API created
- [x] Proposal API created
- [x] Comments API created
- [x] Blockchain routes created
- [x] Error handling implemented
- [x] CORS enabled
- [x] Server running on port 5000

### Documentation
- [x] Backend README created
- [x] API testing guide created
- [x] Production setup guide created
- [x] Architecture diagrams created

---

## 🔧 Your Action Items (URGENT)

### Step 1: Get M-Pesa Credentials
**Timeline:** This week
**Action:** Register at Safaricom Daraja API

- [ ] Go to https://developer.safaricom.co.ke/
- [ ] Click "Register"
- [ ] Fill in business details
- [ ] Verify email
- [ ] Create an app
- [ ] Get credentials:
  - [ ] Consumer Key
  - [ ] Consumer Secret
  - [ ] Business Shortcode
  - [ ] Passkey

**Note:** This is free and takes ~30 minutes

### Step 2: Update Environment File
**Timeline:** Immediately after getting credentials
**Action:** Configure backend with M-Pesa credentials

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_BUSINESS_SHORTCODE=your_shortcode_here
MPESA_PASSKEY=your_passkey_here
MPESA_ENVIRONMENT=sandbox
BACKEND_URL=http://localhost:5000
```

- [ ] Copy `.env.example` to `.env`
- [ ] Add Consumer Key
- [ ] Add Consumer Secret
- [ ] Add Business Shortcode
- [ ] Add Passkey
- [ ] Set environment to `sandbox`
- [ ] Set BACKEND_URL to `http://localhost:5000`

### Step 3: Test M-Pesa in Sandbox
**Timeline:** After updating `.env`
**Action:** Verify M-Pesa integration works

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Test STK Push
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "test-donation",
    "description": "Test donation"
  }'
```

- [ ] Backend starts without errors
- [ ] STK Push endpoint responds
- [ ] Response includes `CheckoutRequestID`
- [ ] No authentication errors

### Step 4: Test Callback Handling
**Timeline:** After STK Push works
**Action:** Verify backend receives M-Pesa callbacks

- [ ] Set up ngrok or similar to expose localhost
- [ ] Update BACKEND_URL in `.env` to public URL
- [ ] Test with M-Pesa sandbox
- [ ] Verify callback is received
- [ ] Verify donation is recorded

### Step 5: Test with Real M-Pesa (Optional)
**Timeline:** After sandbox testing works
**Action:** Test with real M-Pesa (small amounts)

- [ ] Change MPESA_ENVIRONMENT to `production`
- [ ] Test with 1 KES donation
- [ ] Verify payment goes through
- [ ] Verify callback is received
- [ ] Verify donation is recorded

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Payment
```
Input: Phone 254712345678, Amount 100
Expected: STK Push sent, user enters PIN, payment confirmed
Result: Donation recorded in backend
```

- [ ] Test this scenario

### Scenario 2: User Cancels Payment
```
Input: Phone 254712345678, Amount 100
Expected: User cancels STK prompt
Result: Backend receives cancellation callback
```

- [ ] Test this scenario

### Scenario 3: Invalid Phone Number
```
Input: Phone "invalid", Amount 100
Expected: Error response
Result: "Invalid phone number format"
```

- [ ] Test this scenario

### Scenario 4: Invalid Amount
```
Input: Phone 254712345678, Amount -100
Expected: Error response
Result: "Amount must be positive"
```

- [ ] Test this scenario

### Scenario 5: Multiple Donations
```
Input: 5 different donors, different amounts
Expected: All donations recorded
Result: All donations in database
```

- [ ] Test this scenario

---

## 📊 Expected Responses

### Successful STK Push
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "data": {
    "MerchantRequestID": "29115-34620561-1",
    "CheckoutRequestID": "ws_CO_DMZ_123456789_2025102113000000",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
  }
}
```

### Successful Callback
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_DMZ_123456789_2025102113000000",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 100},
          {"Name": "MpesaReceiptNumber", "Value": "LHD61H5QV61"},
          {"Name": "TransactionDate", "Value": 20251021130000},
          {"Name": "PhoneNumber", "Value": 254712345678}
        ]
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Invalid Consumer Key"
- [ ] Verify Consumer Key in `.env`
- [ ] Check for extra spaces
- [ ] Verify credentials from Daraja dashboard

### Error: "Invalid Passkey"
- [ ] Verify Passkey in `.env`
- [ ] Check for extra spaces
- [ ] Verify credentials from Daraja dashboard

### Error: "Invalid Phone Number"
- [ ] Ensure format: `254XXXXXXXXX`
- [ ] Remove leading 0 if present
- [ ] Verify it's a valid Kenyan number

### Error: "Connection Refused"
- [ ] Verify backend is running
- [ ] Check port 5000 is not blocked
- [ ] Verify BACKEND_URL is correct

### Error: "Callback Not Received"
- [ ] Verify BACKEND_URL is publicly accessible
- [ ] Check firewall settings
- [ ] Verify callback URL in M-Pesa dashboard

---

## 📈 Success Metrics

After Phase 2 is complete, you should have:

- [x] M-Pesa credentials configured
- [x] STK Push working in sandbox
- [x] Callbacks being received
- [x] Donations being recorded
- [x] All test scenarios passing
- [x] Ready for Phase 3 (Firebase)

---

## 🚀 Next Phase (Phase 3)

Once Phase 2 is complete:
1. Set up Firebase project
2. Migrate data storage from in-memory to Firebase
3. Add real-time updates
4. Add user authentication

---

## 📞 Support

If you get stuck:
1. Check `backend/API_TESTING.md` for examples
2. Check `PRODUCTION_SETUP_GUIDE.md` for detailed setup
3. Check `backend/README.md` for configuration
4. Ask me directly!

---

## ✅ Final Checklist

Before moving to Phase 3:
- [ ] M-Pesa credentials obtained
- [ ] `.env` file updated
- [ ] Backend tested in sandbox
- [ ] Callbacks working
- [ ] All test scenarios passing
- [ ] Ready for Firebase integration

---

## 🎉 You're Ready!

Once you complete this checklist, you'll have:
- ✅ Real M-Pesa payments working
- ✅ No MetaMask needed
- ✅ Familiar M-Pesa UX for Kenyans
- ✅ Transparent blockchain recording

Let's go! 🚀

