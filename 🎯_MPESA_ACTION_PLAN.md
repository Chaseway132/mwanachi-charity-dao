# 🎯 M-Pesa Testing Action Plan

## 📋 **Your Mission**

Test M-Pesa integration with your 3 SIM cards to verify:
1. ✅ Payment initiation works
2. ✅ STK prompt appears on phone
3. ✅ Payment confirmation is logged
4. ✅ Transactions are saved in MongoDB

---

## ⏱️ **Timeline: 30 Minutes**

### Phase 1: Setup (5 minutes)
- [ ] Read: `⚡_MPESA_QUICK_START.md`
- [ ] Verify backend is running
- [ ] Open frontend in browser

### Phase 2: Testing (20 minutes)
- [ ] Test 1: KES 1 payment (5 min)
- [ ] Test 2: KES 100 payment (5 min)
- [ ] Test 3: KES 1000 payment (5 min)
- [ ] Test 4: Verify all in MongoDB (5 min)

### Phase 3: Documentation (5 minutes)
- [ ] Take screenshots
- [ ] Note transaction codes
- [ ] Share results

---

## 🚀 **Phase 1: Setup (5 minutes)**

### Step 1: Read Quick Start
```
Open: ⚡_MPESA_QUICK_START.md
Time: 2 minutes
```

### Step 2: Verify Backend
```bash
curl https://mwanachi-charity-dao-backend.onrender.com/health
```
Should return: `{"status":"ok"}`

### Step 3: Open Frontend
```
https://chaseway132.github.io/mwanachi-charity-dao/
```

### Step 4: Find M-Pesa Form
- Look for "Donations" section
- Find "M-Pesa" tab or button
- You should see:
  - Phone Number input
  - Amount input
  - "Send STK Push" button

---

## 🧪 **Phase 2: Testing (20 minutes)**

### Test 1: Minimum Amount (5 minutes)

**Setup:**
- Phone: Your first M-Pesa SIM
- Amount: `1` KES

**Steps:**
1. Enter phone number: `0712345678` (or your actual number)
2. Enter amount: `1`
3. Click "Send STK Push"
4. Wait 10 seconds for STK prompt on phone
5. Enter M-Pesa PIN
6. Wait for confirmation

**Expected Results:**
- ✅ STK prompt appears on phone
- ✅ You can enter PIN
- ✅ "Transaction successful" message
- ✅ Frontend shows success

**Verification:**
1. Go to Render logs
2. Look for: `✅ Payment successful`
3. Look for: `MpesaReceiptNumber: ABC123DEF456`

---

### Test 2: Small Amount (5 minutes)

**Setup:**
- Phone: Your second M-Pesa SIM
- Amount: `100` KES

**Steps:**
1. Enter phone number: `0712345679` (or your actual number)
2. Enter amount: `100`
3. Click "Send STK Push"
4. Wait for STK prompt
5. Enter M-Pesa PIN
6. Wait for confirmation

**Expected Results:**
- ✅ STK prompt appears
- ✅ Payment succeeds
- ✅ Frontend shows success

**Verification:**
1. Check Render logs for transaction
2. Note the receipt number

---

### Test 3: Larger Amount (5 minutes)

**Setup:**
- Phone: Your third M-Pesa SIM
- Amount: `1000` KES

**Steps:**
1. Enter phone number: `0712345680` (or your actual number)
2. Enter amount: `1000`
3. Click "Send STK Push"
4. Wait for STK prompt
5. Enter M-Pesa PIN
6. Wait for confirmation

**Expected Results:**
- ✅ STK prompt appears
- ✅ Payment succeeds
- ✅ Frontend shows success

**Verification:**
1. Check Render logs for transaction
2. Note the receipt number

---

### Test 4: Verify MongoDB (5 minutes)

**Steps:**
1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click "Databases"
4. Click "Browse Collections"
5. Look for "donations" collection
6. You should see 3 records:
   - Amount: 1 KES
   - Amount: 100 KES
   - Amount: 1000 KES

**Expected Data:**
```json
{
  "id": "mpesa_ABC123DEF456",
  "type": "mpesa",
  "phoneNumber": "254712345678",
  "amount": 1,
  "mpesaReceiptNumber": "ABC123DEF456",
  "status": "confirmed",
  "createdAt": "2025-10-23T10:30:00Z"
}
```

---

## 📸 **Phase 3: Documentation (5 minutes)**

### Screenshots to Take:

1. **STK Prompt on Phone**
   - Show the M-Pesa prompt
   - Show the amount and shortcode

2. **Success Message on Frontend**
   - Show "Payment completed successfully"
   - Show the transaction details

3. **Render Logs**
   - Show: `✅ Payment successful`
   - Show: `MpesaReceiptNumber`
   - Show: `✅ M-Pesa donation recorded`

4. **MongoDB Records**
   - Show all 3 donations in collection
   - Show the transaction details

---

## ✅ **Success Checklist**

### Test 1 (KES 1):
- [ ] STK prompt appeared
- [ ] Payment succeeded
- [ ] Render logs show transaction
- [ ] MongoDB has record

### Test 2 (KES 100):
- [ ] STK prompt appeared
- [ ] Payment succeeded
- [ ] Render logs show transaction
- [ ] MongoDB has record

### Test 3 (KES 1000):
- [ ] STK prompt appeared
- [ ] Payment succeeded
- [ ] Render logs show transaction
- [ ] MongoDB has record

### Overall:
- [ ] All 3 tests passed
- [ ] All 3 transactions in MongoDB
- [ ] All receipt numbers logged
- [ ] Frontend shows success messages

---

## 🐛 **If Something Goes Wrong**

### Issue: "Failed to initiate payment"
→ Read: `🔧_MPESA_DEBUGGING.md` - Issue 1

### Issue: STK prompt doesn't appear
→ Read: `🔧_MPESA_DEBUGGING.md` - Issue 2

### Issue: Payment succeeds but not logged
→ Read: `🔧_MPESA_DEBUGGING.md` - Issue 3

### Issue: Request timeout
→ Read: `🔧_MPESA_DEBUGGING.md` - Issue 4

---

## 📞 **What to Share After Testing**

1. **Summary:**
   - How many tests passed (3/3?)
   - Any errors encountered
   - Total amount sent

2. **Screenshots:**
   - STK prompt on phone
   - Success message on frontend
   - Render logs
   - MongoDB records

3. **Transaction Details:**
   - Phone numbers used
   - Amounts sent
   - Receipt numbers
   - Timestamps

4. **Observations:**
   - How long did STK take to appear?
   - Any issues encountered?
   - Suggestions for improvement?

---

## 🎯 **Next Steps After Testing**

### If All Tests Pass:
1. ✅ Celebrate! 🎉
2. ✅ Document results
3. ✅ Deploy smart contracts
4. ✅ Link donations to campaigns

### If Some Tests Fail:
1. ❌ Debug using `🔧_MPESA_DEBUGGING.md`
2. ❌ Fix the issue
3. ❌ Retry the test
4. ❌ Share results

---

## 📚 **Documentation Reference**

| Document | Purpose | Time |
|----------|---------|------|
| `⚡_MPESA_QUICK_START.md` | Quick overview | 5 min |
| `🧪_MPESA_TESTING_GUIDE.md` | Detailed guide | 15 min |
| `🔧_MPESA_DEBUGGING.md` | Troubleshooting | As needed |
| `📋_MPESA_TESTING_SUMMARY.md` | Summary | 5 min |
| `🎯_MPESA_ACTION_PLAN.md` | This file | 30 min |

---

## 🚀 **Ready to Start?**

1. ✅ Read: `⚡_MPESA_QUICK_START.md`
2. ✅ Go to: https://chaseway132.github.io/mwanachi-charity-dao/
3. ✅ Find M-Pesa payment form
4. ✅ Test with KES 1 first
5. ✅ Share results

---

**Let's test M-Pesa! 💳🚀**

Time to start: **NOW**
Expected completion: **30 minutes**

