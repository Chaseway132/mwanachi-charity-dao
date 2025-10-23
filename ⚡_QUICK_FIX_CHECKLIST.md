# ⚡ Quick Fix Checklist - 500 Error

## 🎯 **Did You Do These Steps?**

### Step 1: Go to Render Dashboard
- [ ] Opened https://dashboard.render.com
- [ ] Logged in

### Step 2: Select Backend Service
- [ ] Clicked `mwanachi-charity-dao-backend`

### Step 3: Go to Environment Tab
- [ ] Clicked **"Environment"** on left sidebar
- [ ] Can see list of environment variables

### Step 4: Check These Variables
- [ ] `BACKEND_URL` = `https://mwanachi-charity-dao-backend.onrender.com`
- [ ] `MPESA_CALLBACK_URL` = `https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback`
- [ ] `MPESA_CONSUMER_KEY` = `2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz`
- [ ] `MPESA_CONSUMER_SECRET` = `wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq`
- [ ] `MPESA_BUSINESS_SHORTCODE` = `174379`
- [ ] `MPESA_PASSKEY` = `bfb279f9ba9b9d4edea5a426c7cc874b`
- [ ] `MPESA_ENVIRONMENT` = `sandbox`
- [ ] `MONGODB_URI` = `mongodb+srv://mwanachi_admin:X2ChUu0e0FmxzYQm@cluster0.9ihsbgm.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority`

### Step 5: Redeploy
- [ ] Clicked **"Deploy"** or **"Redeploy"** button
- [ ] Waited for "Deploy successful" (green checkmark)
- [ ] Took 2-3 minutes

### Step 6: Test Again
- [ ] Went to https://chaseway132.github.io/mwanachi-charity-dao/
- [ ] Entered phone number
- [ ] Entered amount: 1
- [ ] Clicked "Send STK Push"

---

## 🔍 **If Still Getting 500 Error**

### Check Render Logs:
1. Go to Render dashboard
2. Click your backend service
3. Click **"Logs"** tab
4. Look for error messages
5. **Share the last 50 lines with me**

### What to Look For:
```
❌ BACKEND_URL not set
❌ M-Pesa credentials not configured
❌ Error getting M-Pesa access token
❌ STK Push error
```

---

## 📸 **What to Share**

If still broken, share:
1. Screenshot of Render Environment variables
2. Last 50 lines of Render logs
3. Exact error message from browser console

---

## ✅ **If It Works**

You should see:
```
✅ STK Push sent successfully
✅ STK prompt appears on phone
✅ You enter PIN
✅ Payment succeeds
```

---

**Did you update Render environment variables? If yes, share the logs! 📊**

