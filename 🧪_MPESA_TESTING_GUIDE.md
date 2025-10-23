# 🧪 M-Pesa Testing Guide

## 📱 **What You Need**

✅ **You have:**
- 3 M-Pesa SIM cards with M-Pesa access
- Sandbox credentials in `.env`
- Backend deployed on Render
- Frontend deployed on GitHub Pages

---

## 🎯 **Testing Flow**

```
Your Phone (M-Pesa SIM)
    ↓
Frontend: Enter phone & amount
    ↓
Click "Send STK Push"
    ↓
Backend: POST /api/mpesa/stk-push
    ↓
M-Pesa Sandbox API
    ↓
STK Prompt on Your Phone
    ↓
You Enter PIN
    ↓
M-Pesa Processes Payment
    ↓
M-Pesa Sends Callback
    ↓
Backend: POST /api/mpesa/callback
    ↓
Backend: Logs Transaction
    ↓
Frontend: Shows Success
```

---

## 🚀 **Step 1: Access the Frontend**

1. Go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Look for **"Donations"** or **"Special Causes"** section
3. Find the **"M-Pesa"** payment option

---

## 💳 **Step 2: Test STK Push**

### Test 1: Minimum Amount (KES 1)
1. **Phone Number:** Enter one of your M-Pesa SIM numbers
   - Format: `0712345678` or `254712345678`
2. **Amount:** `1` (KES)
3. Click **"Send STK Push"**
4. **Expected:** STK prompt appears on your phone within 10 seconds

### Test 2: Small Amount (KES 100)
1. **Phone Number:** Enter another M-Pesa SIM
2. **Amount:** `100` (KES)
3. Click **"Send STK Push"**
4. **Expected:** STK prompt appears on your phone

### Test 3: Larger Amount (KES 1000)
1. **Phone Number:** Enter your third M-Pesa SIM
2. **Amount:** `1000` (KES)
3. Click **"Send STK Push"**
4. **Expected:** STK prompt appears on your phone

---

## 📲 **Step 3: Complete Payment on Phone**

When you see the STK prompt on your phone:

1. **Look for:** "Enter M-Pesa PIN to send KES [amount] to 174379"
2. **Enter:** Your M-Pesa PIN
3. **Wait:** 5-10 seconds for confirmation
4. **You should see:** "Transaction successful" message

---

## ✅ **Step 4: Verify Backend Logs**

Go to Render dashboard and check logs:

### Good Signs:
```
POST /api/mpesa/stk-push
✅ STK Push sent successfully
CheckoutRequestID: [ID]

M-Pesa Callback received:
✅ Payment successful: [amount]
MpesaReceiptNumber: [receipt]
PhoneNumber: [your number]
TransactionDate: [date]

✅ M-Pesa donation recorded: [donation ID]
✅ Donation recorded successfully
```

### Bad Signs:
```
❌ Error getting M-Pesa access token
❌ STK Push error
❌ Failed to initiate payment
```

---

## 🔍 **Step 5: Check Transaction Logs**

### In Render Logs, Look For:
```
💾 Saving campaign to MongoDB: [campaign]
✅ Campaign saved to MongoDB: [id]
```

### Check MongoDB Atlas:
1. Go to: https://cloud.mongodb.com
2. Click "Databases"
3. Click "Browse Collections"
4. Look for "donations" collection
5. You should see your M-Pesa transactions logged

---

## 📊 **Expected Data in MongoDB**

Each M-Pesa transaction should create a record like:

```json
{
  "id": "mpesa_[receipt_number]",
  "type": "mpesa",
  "phoneNumber": "254712345678",
  "amount": 1000,
  "mpesaReceiptNumber": "ABC123DEF456",
  "status": "confirmed",
  "createdAt": "2025-10-23T10:30:00Z",
  "mpesaTransactionDate": "20251023103000",
  "blockchainStatus": "pending"
}
```

---

## 🧪 **Test Scenarios**

### Scenario 1: Successful Payment
- ✅ STK prompt appears
- ✅ You enter PIN
- ✅ Payment succeeds
- ✅ Backend logs transaction
- ✅ MongoDB records donation

### Scenario 2: Cancelled Payment
- ✅ STK prompt appears
- ✅ You cancel (don't enter PIN)
- ✅ Backend logs cancellation
- ✅ Frontend shows "Payment cancelled"

### Scenario 3: Timeout
- ✅ STK prompt doesn't appear
- ✅ Frontend waits 2 minutes
- ✅ Frontend shows "Request timeout"
- ✅ You can retry

### Scenario 4: Invalid Phone
- ✅ Enter invalid phone number
- ✅ Backend should reject
- ✅ Frontend shows error

---

## 🐛 **Troubleshooting**

### Problem: STK Prompt Doesn't Appear
**Possible Causes:**
1. Phone number format is wrong
2. M-Pesa SIM doesn't have active M-Pesa
3. Backend didn't send request
4. Sandbox API is down

**Fix:**
1. Verify phone number format: `254712345678`
2. Test M-Pesa on phone directly (send money)
3. Check Render logs for errors
4. Try again in 5 minutes

### Problem: "Failed to initiate payment"
**Possible Causes:**
1. Backend URL is wrong
2. M-Pesa credentials are invalid
3. Network connectivity issue

**Fix:**
1. Check backend is running: `curl https://mwanachi-charity-dao-backend.onrender.com/health`
2. Verify `.env` has correct credentials
3. Check Render logs for errors

### Problem: Payment Succeeds but Not Logged
**Possible Causes:**
1. MongoDB not connected
2. Callback URL is wrong
3. Donation handler error

**Fix:**
1. Check Render logs for "MongoDB campaigns found"
2. Verify `MPESA_CALLBACK_URL` in `.env`
3. Check for errors in callback processing

---

## 📋 **Testing Checklist**

- [ ] Test 1: KES 1 payment
- [ ] Test 2: KES 100 payment
- [ ] Test 3: KES 1000 payment
- [ ] Check Render logs for all 3 transactions
- [ ] Check MongoDB for all 3 donations
- [ ] Test cancelled payment
- [ ] Test invalid phone number
- [ ] Verify transaction codes are logged

---

## 🎯 **Success Criteria**

✅ **All tests pass when:**
1. STK prompt appears on phone
2. Payment completes successfully
3. Backend logs transaction
4. MongoDB records donation
5. Transaction code is visible in logs
6. Frontend shows success message

---

## 📞 **What to Share After Testing**

1. **Screenshots:**
   - STK prompt on phone
   - Success message on frontend
   - Render logs showing transaction

2. **Transaction Details:**
   - Phone number used
   - Amount sent
   - M-Pesa receipt number
   - Timestamp

3. **MongoDB Record:**
   - Screenshot of donation in MongoDB Atlas

---

**Ready to test? Let's go! 🚀**

Start with Test 1 (KES 1) and let me know what happens!

