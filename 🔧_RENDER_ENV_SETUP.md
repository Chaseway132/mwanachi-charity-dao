# 🔧 Render Environment Variables Setup

## 🎯 **The Problem**

The `.env` file is in `.gitignore` (for security), so it's NOT pushed to GitHub. This means Render doesn't have the updated environment variables!

**Solution:** Set environment variables directly in Render dashboard.

---

## 📋 **Required Environment Variables**

### M-Pesa Configuration
```
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback
```

### Backend Configuration
```
PORT=5000
NODE_ENV=production
BACKEND_URL=https://mwanachi-charity-dao-backend.onrender.com
```

### MongoDB Configuration
```
MONGODB_URI=mongodb+srv://mwanachi_admin:X2ChUu0e0FmxzYQm@cluster0.9ihsbgm.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
```

### Admin Authentication
```
JWT_SECRET=528ace103443d836b4558f668285b57b362741b5a402aa6497575385e56421c9
ADMIN_PASSWORD=Charity@DAO2025!Secure
```

### Blockchain Configuration (Optional)
```
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
```

---

## 🚀 **How to Set Environment Variables in Render**

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in with your account

### Step 2: Select Your Backend Service
1. Click on your backend service
2. Name should be: `mwanachi-charity-dao-backend`

### Step 3: Go to Environment Tab
1. Click on the service
2. Look for **"Environment"** tab on the left sidebar
3. Click it

### Step 4: Add Environment Variables
1. You'll see a form to add variables
2. For each variable:
   - **Key:** (e.g., `MPESA_CONSUMER_KEY`)
   - **Value:** (e.g., `2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz`)
3. Click **"Add"** or **"Save"**

### Step 5: Redeploy
1. After adding all variables
2. Click **"Deploy"** or **"Redeploy"**
3. Wait for "Deploy successful"

---

## ✅ **Verification Checklist**

### In Render Environment Tab, You Should Have:

- [ ] `MPESA_CONSUMER_KEY` = `2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz`
- [ ] `MPESA_CONSUMER_SECRET` = `wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq`
- [ ] `MPESA_BUSINESS_SHORTCODE` = `174379`
- [ ] `MPESA_PASSKEY` = `bfb279f9ba9b9d4edea5a426c7cc874b`
- [ ] `MPESA_ENVIRONMENT` = `sandbox`
- [ ] `MPESA_CALLBACK_URL` = `https://mwanachi-charity-dao-backend.onrender.com/api/mpesa/callback`
- [ ] `BACKEND_URL` = `https://mwanachi-charity-dao-backend.onrender.com`
- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = `mongodb+srv://mwanachi_admin:X2ChUu0e0FmxzYQm@cluster0.9ihsbgm.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority`
- [ ] `JWT_SECRET` = `528ace103443d836b4558f668285b57b362741b5a402aa6497575385e56421c9`
- [ ] `ADMIN_PASSWORD` = `Charity@DAO2025!Secure`

---

## 🔍 **How to Check Current Environment Variables**

### In Render Dashboard:
1. Click your backend service
2. Go to **"Environment"** tab
3. You'll see all current variables
4. Check if they match the required list above

### If Missing:
1. Add the missing variables
2. Click **"Save"** or **"Add"**
3. Redeploy

---

## 🚨 **Common Issues**

### Issue 1: Variables Not Updated
**Problem:** You added variables but they're not being used

**Solution:**
1. Make sure you clicked **"Save"** or **"Add"**
2. Redeploy the service
3. Wait for "Deploy successful"
4. Test again

### Issue 2: Wrong Variable Value
**Problem:** You copied the value incorrectly

**Solution:**
1. Go to Environment tab
2. Click the variable
3. Check the value carefully
4. Fix if needed
5. Redeploy

### Issue 3: Missing Variable
**Problem:** Backend crashes because a variable is missing

**Solution:**
1. Check the error logs
2. Find which variable is missing
3. Add it to Render Environment
4. Redeploy

---

## 📊 **Environment Variables Explained**

### M-Pesa Variables
- `MPESA_CONSUMER_KEY` - API authentication key
- `MPESA_CONSUMER_SECRET` - API authentication secret
- `MPESA_BUSINESS_SHORTCODE` - Your business code (174379)
- `MPESA_PASSKEY` - M-Pesa passkey for password generation
- `MPESA_ENVIRONMENT` - `sandbox` for testing, `production` for real
- `MPESA_CALLBACK_URL` - Where M-Pesa sends payment confirmation

### Backend Variables
- `BACKEND_URL` - Your backend URL (for callbacks)
- `PORT` - Server port (5000)
- `NODE_ENV` - Environment (`production` on Render)

### Database Variables
- `MONGODB_URI` - MongoDB connection string

### Security Variables
- `JWT_SECRET` - Secret for JWT tokens
- `ADMIN_PASSWORD` - Admin login password

---

## 🔐 **Security Notes**

### Why .env is in .gitignore:
- ✅ Protects sensitive credentials
- ✅ Prevents accidental exposure on GitHub
- ✅ Each environment has its own variables

### Best Practices:
- ✅ Never commit `.env` to GitHub
- ✅ Set variables in Render dashboard
- ✅ Use strong passwords
- ✅ Rotate credentials regularly
- ✅ Don't share credentials

---

## 🎯 **Next Steps**

1. ✅ Go to Render dashboard
2. ✅ Click your backend service
3. ✅ Go to Environment tab
4. ✅ Add/update all required variables
5. ✅ Redeploy
6. ✅ Test M-Pesa again

---

## 💡 **Pro Tips**

- ✅ Copy-paste values carefully
- ✅ Check for extra spaces
- ✅ Verify all variables are set
- ✅ Redeploy after changes
- ✅ Check logs after redeploy

---

**Go to Render and set the environment variables! 🚀**

