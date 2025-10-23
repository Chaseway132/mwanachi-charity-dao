# 🔍 M-Pesa 500 Error - Debugging Guide

## 🎯 **What's Happening**

You're getting a **500 Internal Server Error** when trying to send STK Push:

```
POST https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/stk-push 500
```

This means the backend is crashing when processing your request.

---

## 🔧 **What We've Done**

### Fix 1: Updated BACKEND_URL ✅
Changed `.env`:
```diff
- BACKEND_URL=http://localhost:5000
+ BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com
```

### Fix 2: Added Detailed Logging ✅
Updated `backend/routes/mpesa.js` with logging at every step:
- ✅ Request received
- ✅ Credentials check
- ✅ Phone number formatting
- ✅ Access token retrieval
- ✅ M-Pesa API call
- ✅ Error details

---

## 📋 **Next Steps to Debug**

### Step 1: Wait for Render to Redeploy
- Go to: https://dashboard.render.com
- Select your backend service
- Wait for "Deploy successful"
- Should take 1-2 minutes

### Step 2: Test M-Pesa Again
1. Go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Find M-Pesa payment form
3. Enter phone: `0712345678`
4. Enter amount: `1`
5. Click "Send STK Push"

### Step 3: Check Render Logs
1. Go to: https://dashboard.render.com
2. Click your backend service
3. Click "Logs"
4. Look for detailed logging output:

```
📱 STK Push request received
📝 Request data: { phoneNumber: '0712345678', amount: 1 }
📞 Formatted phone: 254712345678
🔐 M-Pesa Config: { environment: 'sandbox', ... }
🔐 Getting M-Pesa access token...
🔗 OAuth URL: https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials
✅ Access token obtained successfully
📤 Sending STK Push to M-Pesa...
🔗 Callback URL: https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback
✅ STK Push sent successfully
📊 M-Pesa Response: { ... }
```

---

## 🐛 **Possible Issues & Solutions**

### Issue 1: BACKEND_URL Not Set
**Log Message:**
```
❌ BACKEND_URL not set in environment
```

**Solution:**
1. Go to Render dashboard
2. Click your backend service
3. Go to "Environment"
4. Add: `BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com`
5. Redeploy

### Issue 2: M-Pesa Credentials Missing
**Log Message:**
```
❌ M-Pesa credentials not configured
```

**Solution:**
1. Check `.env` file has:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_BUSINESS_SHORTCODE`
   - `MPESA_PASSKEY`
2. Verify in Render environment variables
3. Redeploy

### Issue 3: M-Pesa OAuth Token Error
**Log Message:**
```
❌ Error getting M-Pesa access token: [error]
❌ Full error: { ... }
```

**Solution:**
1. Check credentials are correct
2. Check M-Pesa API is accessible
3. Check network connectivity
4. Try again in 5 minutes

### Issue 4: M-Pesa API Error
**Log Message:**
```
❌ STK Push error: [error]
❌ Full error: { mpesaError: { ... } }
```

**Solution:**
1. Check phone number format
2. Check amount is valid (1-150000)
3. Check M-Pesa API response
4. Try again

---

## 📊 **Log Analysis**

### Good Logs:
```
✅ Access token obtained successfully
✅ STK Push sent successfully
📊 M-Pesa Response: { CheckoutRequestID: '...' }
```

### Bad Logs:
```
❌ BACKEND_URL not set
❌ M-Pesa credentials not configured
❌ Error getting M-Pesa access token
❌ STK Push error
```

---

## 🔄 **Render Deployment Status**

### Check Deployment:
1. Go to: https://dashboard.render.com
2. Click your backend service
3. Look for:
   - ✅ "Deploy successful" (green)
   - ⏳ "Deploying" (yellow)
   - ❌ "Deploy failed" (red)

### If Deployment Failed:
1. Click "Logs"
2. Look for error messages
3. Fix the issue
4. Redeploy

---

## 📞 **What to Share When Debugging**

1. **Exact error message** from browser console
2. **Last 50 lines** of Render logs
3. **Phone number** used (last 4 digits)
4. **Amount** sent
5. **Screenshot** of error

---

## ✅ **Verification Checklist**

- [ ] Render shows "Deploy successful"
- [ ] Backend is running
- [ ] BACKEND_URL is set in environment
- [ ] M-Pesa credentials are set
- [ ] Logs show detailed output
- [ ] No error messages in logs
- [ ] STK prompt appears on phone
- [ ] Payment succeeds

---

## 🚀 **Timeline**

1. **Now:** Code pushed with improved logging
2. **1-2 min:** Render redeploys
3. **2-3 min:** Test M-Pesa again
4. **3-5 min:** Check logs for detailed output
5. **5+ min:** Debug based on logs

---

## 💡 **Pro Tips**

- ✅ Check logs IMMEDIATELY after testing
- ✅ Look for the first error message
- ✅ Share the full error with details
- ✅ Try again after fixing
- ✅ Check Render is fully deployed

---

**Wait for Render to redeploy, then test again! 🚀**

The improved logging will help us see exactly where the error is happening!

