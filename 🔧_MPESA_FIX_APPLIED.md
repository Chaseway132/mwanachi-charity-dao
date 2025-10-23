# 🔧 M-Pesa 500 Error - FIXED! ✅

## 🎯 **What Was Wrong**

You got a **500 Internal Server Error** when trying to send STK Push. Here's why:

### The Problem:
```
Frontend sends: POST /api/mpesa/stk-push
Backend tries to build callback URL: http://localhost:5000/api/mpesa/callback
❌ But backend is running on Render, not localhost!
❌ M-Pesa can't reach localhost:5000
❌ Backend crashes with 500 error
```

### Root Cause:
In `backend/.env`, the `BACKEND_URL` was set to:
```
BACKEND_URL=http://localhost:5000
```

But when running on Render, it should be:
```
BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com
```

---

## ✅ **What We Fixed**

Updated `backend/.env`:
```diff
- BACKEND_URL=http://localhost:5000
+ BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com
```

This tells the backend to use the correct Render URL when building the M-Pesa callback URL.

---

## 🚀 **What Happens Now**

1. ✅ Code pushed to GitHub
2. ✅ Render automatically redeploys (1-2 minutes)
3. ✅ Backend now uses correct callback URL
4. ✅ M-Pesa can reach the callback endpoint
5. ✅ STK Push will work!

---

## 📋 **Next Steps**

### Step 1: Wait for Render to Redeploy
- Go to: https://dashboard.render.com
- Select your backend service
- Wait for "Deploy successful" message
- Should take 1-2 minutes

### Step 2: Test M-Pesa Again
1. Go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Find M-Pesa payment form
3. Enter phone: `0712345678`
4. Enter amount: `1` KES
5. Click "Send STK Push"
6. Check phone for STK prompt

### Step 3: Verify Success
- ✅ STK prompt appears on phone
- ✅ You enter PIN
- ✅ Payment succeeds
- ✅ Frontend shows success message
- ✅ Render logs show: `✅ Payment successful`
- ✅ MongoDB has donation record

---

## 🔍 **How to Check Render Logs**

1. Go to: https://dashboard.render.com
2. Click your backend service
3. Click "Logs"
4. Look for:
   ```
   POST /api/mpesa/stk-push
   ✅ STK Push sent successfully
   CheckoutRequestID: [ID]
   ```

---

## 💡 **Why This Matters**

The callback URL is how M-Pesa tells your backend that payment was successful:

```
Your Phone
    ↓ Payment Complete
M-Pesa API
    ↓ Sends Callback
Backend Callback URL: https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback
    ↓ Receives Payment Confirmation
Backend
    ↓ Logs Transaction
MongoDB
    ↓ Saves Donation
```

If the callback URL is wrong, M-Pesa can't reach your backend, and the payment isn't recorded!

---

## ✅ **Verification Checklist**

- [ ] Render shows "Deploy successful"
- [ ] Backend is running
- [ ] M-Pesa form loads
- [ ] STK prompt appears on phone
- [ ] Payment succeeds
- [ ] Render logs show success
- [ ] MongoDB has donation record

---

## 🎉 **You're Ready!**

The fix is deployed. Now test M-Pesa again and it should work! 🚀

**Go test it now!** 💳

