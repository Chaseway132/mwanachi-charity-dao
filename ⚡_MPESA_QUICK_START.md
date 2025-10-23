# ⚡ M-Pesa Quick Start - 5 Minutes

## 🎯 **What We're Testing**

Testing M-Pesa STK Push with your 3 SIM cards to verify:
1. ✅ Payment initiation works
2. ✅ STK prompt appears on phone
3. ✅ Payment confirmation is logged
4. ✅ Transaction codes are saved

---

## 🚀 **Quick Steps**

### Step 1: Open Frontend (30 seconds)
```
https://chaseway132.github.io/mwanachi-charity-dao/
```

### Step 2: Find M-Pesa Payment (30 seconds)
- Look for "Donations" section
- Find "M-Pesa" tab or button
- You should see a form with:
  - Phone Number input
  - Amount input
  - "Send STK Push" button

### Step 3: Test Payment (2 minutes)
1. **Phone:** `0712345678` (your M-Pesa SIM)
2. **Amount:** `1` (KES)
3. **Click:** "Send STK Push"
4. **Wait:** 10 seconds for STK prompt on phone
5. **On Phone:** Enter M-Pesa PIN
6. **Wait:** 5 seconds for confirmation

### Step 4: Check Results (1 minute)
1. Go to Render logs: https://dashboard.render.com
2. Look for: `✅ Payment successful`
3. Look for: `✅ M-Pesa donation recorded`

---

## 📱 **Your Test Numbers**

You have 3 M-Pesa SIM cards:
- SIM 1: Test KES 1
- SIM 2: Test KES 100
- SIM 3: Test KES 1000

---

## ✅ **Success Indicators**

### On Your Phone:
```
STK Prompt appears:
"Enter M-Pesa PIN to send KES 1 to 174379"
↓
You enter PIN
↓
"Transaction successful"
```

### In Render Logs:
```
POST /api/mpesa/stk-push
✅ STK Push sent successfully

M-Pesa Callback received
✅ Payment successful
✅ M-Pesa donation recorded
```

### In MongoDB:
```
New donation record created with:
- mpesaReceiptNumber: ABC123DEF456
- amount: 1
- phoneNumber: 254712345678
- status: confirmed
```

---

## 🐛 **If It Doesn't Work**

### STK Prompt Doesn't Appear
1. Check phone number format: `254712345678`
2. Verify M-Pesa is active on SIM
3. Check Render logs for errors
4. Try again in 5 minutes

### "Failed to initiate payment"
1. Check backend is running
2. Verify credentials in `.env`
3. Check Render logs

### Payment Succeeds but Not Logged
1. Check MongoDB connection
2. Check Render logs for callback errors
3. Verify callback URL is correct

---

## 📊 **What Happens Behind the Scenes**

```
Frontend (Your Browser)
    ↓ POST /api/mpesa/stk-push
Backend (Render)
    ↓ Get M-Pesa Token
M-Pesa Sandbox API
    ↓ Send STK Push
Your Phone
    ↓ You Enter PIN
M-Pesa API
    ↓ Process Payment
M-Pesa Callback
    ↓ POST /api/mpesa/callback
Backend (Render)
    ↓ recordMPesaDonation()
MongoDB
    ↓ Save Transaction
Frontend
    ↓ Show Success
```

---

## 🎯 **Next Steps After Testing**

1. ✅ Test all 3 SIM cards
2. ✅ Verify all transactions in MongoDB
3. ✅ Check Render logs for all callbacks
4. ✅ Then we'll deploy smart contracts

---

## 📞 **Share With Me**

After testing, share:
1. **Screenshot:** STK prompt on phone
2. **Screenshot:** Success message on frontend
3. **Screenshot:** Render logs showing transaction
4. **Screenshot:** MongoDB record

---

**Ready? Let's test M-Pesa! 🚀**

Go to: https://chaseway132.github.io/mwanachi-charity-dao/

Find the M-Pesa payment form and test with KES 1 first!

