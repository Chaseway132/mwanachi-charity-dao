# 🧪 Backend Testing Guide - Render Deployment

## ✅ Backend Status
Your backend is hosted on **Render**. Let's test it!

---

## 🎯 What We Need to Test

### 1. **Health Check**
- Verify backend is running
- Check response time

### 2. **API Endpoints**
- Donations API
- Comments API
- Proposals API
- Blockchain API
- Analytics API

### 3. **M-Pesa Integration**
- STK Push initiation
- Payment status query
- Callback handling

### 4. **Polygon Blockchain**
- Donation recording
- Proposal creation
- Transaction status

---

## 📋 Testing Checklist

### Step 1: Get Your Render Backend URL

Your Render backend URL should be in one of these formats:
```
https://mwanachi-charity-dao-backend.onrender.com
https://your-service-name.onrender.com
```

**To find it:**
1. Go to https://dashboard.render.com
2. Click on your backend service
3. Copy the URL from the top

### Step 2: Test Health Check

```bash
curl https://your-render-url/health
```

Expected response:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-23T..."
}
```

### Step 3: Test API Routes

**Test Route:**
```bash
curl https://your-render-url/api/test
```

**Create Donation:**
```bash
curl -X POST https://your-render-url/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "donorName": "Test Donor",
    "mpesaTransactionId": "TEST-001",
    "mpesaReceiptNumber": "TEST-RECEIPT-001"
  }'
```

**Get Donations:**
```bash
curl https://your-render-url/api/donations
```

---

## 🚀 Automated Testing

### Run Comprehensive Tests

```bash
# From root directory
node backend/comprehensive-test.js
```

This will test:
- ✅ Health check
- ✅ Test route
- ✅ Create donation
- ✅ Get donations
- ✅ Create comment
- ✅ Get comments
- ✅ Track analytics
- ✅ Blockchain recording

---

## 📊 Expected Results

### All Tests Pass ✅
```
✅ Health Check: PASSED
✅ Test Route: PASSED
✅ Create Donation: PASSED
✅ Get Donations: PASSED
✅ Create Comment: PASSED
✅ Get Comments: PASSED
✅ Track Analytics: PASSED
✅ Blockchain Recording: PASSED

🎉 All tests passed!
```

### Some Tests Fail ❌
Check:
1. Backend URL is correct
2. Backend is running on Render
3. Environment variables are set
4. CORS is configured

---

## 🔧 Troubleshooting

### Backend Not Responding
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check Render dashboard - is service running?
- Check logs in Render dashboard
- Verify URL is correct

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend has CORS enabled (check server.js)
- Frontend URL is whitelisted

### M-Pesa Errors
```
Error: Invalid credentials
```
**Solution:**
- Check M-Pesa credentials in Render environment variables
- Verify sandbox vs production environment
- Check phone number format (254XXXXXXXXX)

---

## 📝 Next Steps

1. **Test Backend** - Run comprehensive tests
2. **Update Frontend** - Add Render URL to frontend config
3. **Test M-Pesa** - Test payment flow
4. **Test Polygon** - Test blockchain integration
5. **Deploy to Production** - When ready

---

## 🎯 Your Render Backend URL

**Please provide your Render backend URL:**
```
https://your-service-name.onrender.com
```

Once you provide it, I'll:
1. ✅ Test all endpoints
2. ✅ Verify M-Pesa integration
3. ✅ Test Polygon blockchain
4. ✅ Update frontend configuration
5. ✅ Generate test report

---

## 📞 Support

If you encounter issues:
1. Check Render dashboard logs
2. Verify environment variables
3. Check backend/server.js for errors
4. Review API_TESTING.md for endpoint details

