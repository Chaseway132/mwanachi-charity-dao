# 🔍 How to Check Render Logs

## 🎯 **Why We Need Logs**

The 500 error is happening on the backend. The only way to see what's wrong is to check the Render logs!

---

## 📋 **Step-by-Step Guide**

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in with your account

### Step 2: Select Your Backend Service
1. Look for: `mwanachi-charity-dao-backend`
2. Click on it

### Step 3: Go to Logs Tab
1. On the left sidebar, click **"Logs"**
2. You'll see a stream of log messages

### Step 4: Trigger the Error
1. In another tab, go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Go to M-Pesa payment form
3. Enter phone: `0712345678`
4. Enter amount: `1`
5. Click "Send STK Push"

### Step 5: Watch the Logs
1. Go back to Render Logs tab
2. You should see new log messages appearing
3. Look for error messages (starting with ❌)

### Step 6: Copy the Logs
1. Select all the logs (Ctrl+A)
2. Copy (Ctrl+C)
3. Share with me

---

## 🔍 **What to Look For**

### Good Logs (Success):
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
📊 M-Pesa Response: { CheckoutRequestID: '...' }
```

### Bad Logs (Error):
```
❌ BACKEND_URL not set in environment
❌ M-Pesa credentials not configured
❌ Error getting M-Pesa access token: [error]
❌ STK Push error: [error]
```

---

## 📸 **How to Share Logs**

### Option 1: Copy-Paste
1. Select all logs in Render
2. Copy (Ctrl+C)
3. Paste in chat

### Option 2: Screenshot
1. Take screenshot of Render logs
2. Share screenshot

### Option 3: Last 50 Lines
1. Scroll to bottom of logs
2. Copy last 50 lines
3. Share

---

## 🎯 **What to Share**

When sharing logs, include:
1. **Last 50 lines** of Render logs
2. **Exact error message** (if any)
3. **Timestamp** of when you tested
4. **Phone number** used (last 4 digits)
5. **Amount** sent

---

## 💡 **Pro Tips**

- ✅ Check logs IMMEDIATELY after testing
- ✅ Look for the first error message
- ✅ Share the full error with context
- ✅ Include timestamps
- ✅ Include request details

---

## 🚨 **Common Issues in Logs**

### Issue 1: BACKEND_URL Not Set
```
❌ BACKEND_URL not set in environment
```
**Solution:** Add `BACKEND_URL` to Render environment variables

### Issue 2: M-Pesa Credentials Missing
```
❌ M-Pesa credentials not configured
```
**Solution:** Add M-Pesa credentials to Render environment variables

### Issue 3: OAuth Token Error
```
❌ Error getting M-Pesa access token: [error]
```
**Solution:** Check M-Pesa credentials are correct

### Issue 4: M-Pesa API Error
```
❌ STK Push error: [error]
❌ Full error: { mpesaError: { ... } }
```
**Solution:** Check M-Pesa API response for details

---

## 🔄 **Render Logs Interface**

### Features:
- ✅ Real-time log streaming
- ✅ Search functionality
- ✅ Filter by level (error, warning, info)
- ✅ Copy logs
- ✅ Download logs

### How to Use:
1. **Search:** Use Ctrl+F to search logs
2. **Filter:** Click filter icon to filter by level
3. **Copy:** Select and copy logs
4. **Download:** Click download button

---

## 📊 **Log Levels**

### Error (❌)
- Critical issues
- Exceptions
- Failed operations

### Warning (⚠️)
- Non-critical issues
- Fallback operations
- Deprecated features

### Info (ℹ️)
- Normal operations
- Status updates
- Debug information

### Debug (🔍)
- Detailed information
- Variable values
- Function calls

---

## ✅ **Verification Checklist**

- [ ] Opened Render dashboard
- [ ] Selected backend service
- [ ] Clicked Logs tab
- [ ] Triggered M-Pesa error
- [ ] Saw new logs appearing
- [ ] Copied logs
- [ ] Ready to share

---

## 🎯 **Next Steps**

1. ✅ Go to Render dashboard
2. ✅ Click Logs tab
3. ✅ Test M-Pesa
4. ✅ Copy the logs
5. ✅ Share with me

---

**Go check the Render logs now! 🚀**

The logs will tell us exactly what's wrong! 📊

