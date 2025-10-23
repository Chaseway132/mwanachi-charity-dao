# 🔧 M-Pesa Debugging Guide

## 🎯 **Common Issues & Solutions**

---

## ❌ **Issue 1: "Failed to initiate payment"**

### Symptoms:
- Click "Send STK Push"
- Get error: "Failed to initiate payment"
- No STK prompt on phone

### Root Causes:
1. Backend is down
2. M-Pesa credentials are wrong
3. Network connectivity issue
4. Callback URL is incorrect

### Debug Steps:

**Step 1: Check Backend is Running**
```bash
curl https://mwanachi-charity-dao-backend.onrender.com/health
```
Should return: `{"status":"ok"}`

**Step 2: Check Render Logs**
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Click "Logs"
4. Look for:
   - `Error getting M-Pesa access token`
   - `STK Push error`
   - Network errors

**Step 3: Verify Credentials**
Check `.env` file:
```
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
MPESA_ENVIRONMENT=sandbox
```

**Step 4: Verify Callback URL**
In Render Environment, check:
```
BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com
MPESA_CALLBACK_URL=https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback
```

### Fix:
1. Restart Render backend
2. Wait 2 minutes
3. Try again

---

## ❌ **Issue 2: STK Prompt Doesn't Appear**

### Symptoms:
- "STK Push sent successfully" message
- But no prompt on phone
- Frontend keeps waiting

### Root Causes:
1. Phone number format is wrong
2. M-Pesa SIM doesn't have active M-Pesa
3. Sandbox API rejected the request
4. Phone is not reachable

### Debug Steps:

**Step 1: Check Phone Number Format**
Valid formats:
- ✅ `254712345678` (with country code)
- ✅ `0712345678` (will be converted)
- ❌ `+254712345678` (with +)
- ❌ `712345678` (missing leading digit)

**Step 2: Test M-Pesa on Phone**
1. On your phone, try to send money via M-Pesa
2. If it works, M-Pesa is active
3. If it doesn't work, activate M-Pesa first

**Step 3: Check Render Logs**
Look for:
```
POST /api/mpesa/stk-push
BusinessShortCode: 174379
Amount: 1
PartyA: 254712345678
```

**Step 4: Check M-Pesa Response**
In logs, look for:
```
✅ STK Push sent successfully
CheckoutRequestID: [ID]
```

If you see this, the request was sent. The issue is on M-Pesa's side.

### Fix:
1. Verify phone number format
2. Try a different SIM card
3. Wait 5 minutes and try again
4. Check if M-Pesa is active on SIM

---

## ❌ **Issue 3: Payment Succeeds but Not Logged**

### Symptoms:
- STK prompt appears
- You enter PIN
- "Transaction successful" on phone
- But Render logs don't show callback
- MongoDB doesn't have the transaction

### Root Causes:
1. Callback URL is wrong
2. M-Pesa can't reach backend
3. Callback processing error
4. MongoDB not connected

### Debug Steps:

**Step 1: Check Callback URL**
In `.env`:
```
MPESA_CALLBACK_URL=https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback
```

Should be:
- ✅ HTTPS (not HTTP)
- ✅ Full domain (not localhost)
- ✅ Correct path: `/api/mpesa/callback`

**Step 2: Check Render Logs for Callback**
Look for:
```
POST /api/mpesa/callback
M-Pesa Callback received
```

If you don't see this, M-Pesa couldn't reach your backend.

**Step 3: Check MongoDB Connection**
In Render logs, look for:
```
✅ MongoDB connected successfully
```

If you see:
```
❌ MongoDB connection failed
```

Then donations aren't being saved.

**Step 4: Check Donation Recording**
In logs, look for:
```
✅ M-Pesa donation recorded
```

If you see an error instead, check the error message.

### Fix:
1. Verify callback URL is correct
2. Restart Render backend
3. Verify MongoDB is connected
4. Try payment again

---

## ❌ **Issue 4: "Request timeout"**

### Symptoms:
- Frontend waits 2 minutes
- Shows "Request timeout"
- No payment on phone

### Root Causes:
1. STK prompt took too long to appear
2. Phone was unreachable
3. Sandbox API was slow

### Debug Steps:

**Step 1: Check Render Logs**
Look for:
```
CheckoutRequestID: [ID]
```

**Step 2: Query Payment Status**
Use the CheckoutRequestID to query:
```bash
curl -X POST https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/query-status \
  -H "Content-Type: application/json" \
  -d '{"checkoutRequestId":"[ID]"}'
```

**Step 3: Check Response**
- `ResultCode: 0` = Payment successful
- `ResultCode: 1032` = Still waiting
- Other codes = Payment failed

### Fix:
1. Try again with same phone number
2. Wait 5 minutes between attempts
3. Check if M-Pesa is working on phone

---

## ✅ **Verification Checklist**

### Before Testing:
- [ ] Backend is running
- [ ] Frontend is accessible
- [ ] M-Pesa credentials are in `.env`
- [ ] Callback URL is correct
- [ ] MongoDB is connected
- [ ] M-Pesa is active on SIM

### During Testing:
- [ ] Phone number format is correct
- [ ] Amount is between 1-150000 KES
- [ ] STK prompt appears within 10 seconds
- [ ] You can enter PIN
- [ ] Payment completes

### After Testing:
- [ ] Render logs show callback
- [ ] MongoDB has donation record
- [ ] Transaction code is visible
- [ ] Frontend shows success

---

## 🔍 **Log Analysis**

### Good Flow:
```
POST /api/mpesa/stk-push
✅ STK Push sent successfully
CheckoutRequestID: abc123

M-Pesa Callback received
✅ Payment successful
MpesaReceiptNumber: ABC123DEF456

✅ M-Pesa donation recorded
```

### Bad Flow:
```
POST /api/mpesa/stk-push
❌ Error getting M-Pesa access token
Error: Invalid credentials
```

### Timeout Flow:
```
POST /api/mpesa/stk-push
✅ STK Push sent successfully
CheckoutRequestID: abc123

[No callback received after 2 minutes]
Frontend: Request timeout
```

---

## 📞 **When to Ask for Help**

Share these when debugging:
1. **Exact error message**
2. **Phone number used** (last 4 digits)
3. **Amount sent**
4. **Last 50 lines of Render logs**
5. **Screenshot of error on frontend**

---

**Ready to debug? Let's find the issue! 🔍**

