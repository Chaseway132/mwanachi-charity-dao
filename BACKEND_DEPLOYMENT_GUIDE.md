# 🚀 BACKEND DEPLOYMENT GUIDE

## ✅ Frontend is LIVE!
```
https://chaseway132.github.io/mwanachi-charity-dao/
```

## ❌ Backend is NOT Deployed Yet
That's why you see "failed to fetch" when trying to login.

---

## 🎯 What We Need to Do

1. **Deploy backend** to a free hosting service
2. **Update frontend** with backend URL
3. **Test M-Pesa** sandbox integration
4. **Test admin login** and features

---

## 🏠 Free Backend Hosting Options

### Option 1: **Render** (RECOMMENDED - Easiest)
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Always-on (no sleep)
- ✅ Custom domain support
- 🔗 https://render.com

### Option 2: **Railway**
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Simple setup
- 🔗 https://railway.app

### Option 3: **Fly.io**
- ✅ Free tier available
- ✅ Global deployment
- ✅ Good performance
- 🔗 https://fly.io

### Option 4: **Heroku** (No longer free)
- ❌ Paid only now
- ❌ Not recommended

---

## 📋 QUICK DEPLOYMENT STEPS (Render)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Select your repository: `mwanachi-charity-dao`
3. Fill in:
   - **Name**: `mwanachi-charity-dao-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
Add these in Render dashboard:
```
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Get your URL: `https://mwanachi-charity-dao-backend.onrender.com`

---

## 🔧 Update Frontend with Backend URL

Once backend is deployed, update the frontend:

### File: `charity-dao-frontend/src/config/index.ts`

Find and update:
```typescript
// BEFORE:
export const API_BASE_URL = 'http://localhost:3001';

// AFTER:
export const API_BASE_URL = 'https://mwanachi-charity-dao-backend.onrender.com';
```

### Then redeploy frontend:
```bash
cd charity-dao-frontend
npm run deploy
```

---

## 🧪 Test Backend is Working

### Test 1: Health Check
```
https://mwanachi-charity-dao-backend.onrender.com/health
```
Should return:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-23T..."
}
```

### Test 2: Test Route
```
https://mwanachi-charity-dao-backend.onrender.com/api/test
```
Should return:
```json
{
  "message": "Test route works!"
}
```

### Test 3: Admin Login
From frontend, try logging in with admin credentials.

---

## 🎯 Next Steps After Backend Deployment

### 1. **Test Admin Login**
   - Login with admin credentials
   - Should see analytics dashboard
   - Should see admin features

### 2. **Test M-Pesa Sandbox**
   - Get M-Pesa sandbox credentials from Safaricom Daraja
   - Configure callback URL: `https://your-backend-url/api/mpesa/callback`
   - Test STK Push flow
   - Test payment confirmation

### 3. **Test Full Flow**
   - User initiates donation
   - M-Pesa STK Push appears
   - User enters PIN
   - Payment confirmed
   - Donation recorded on blockchain

---

## 📊 Current Status

```
✅ Frontend: LIVE at https://chaseway132.github.io/mwanachi-charity-dao/
❌ Backend: NOT DEPLOYED YET
⏳ M-Pesa: Ready to test once backend is deployed
```

---

## 🚀 Ready to Deploy?

Choose your hosting:
1. **Render** (Recommended) - https://render.com
2. **Railway** - https://railway.app
3. **Fly.io** - https://fly.io

Then follow the deployment steps above!

---

## 📞 Troubleshooting

### Backend won't start?
- Check logs in hosting dashboard
- Verify environment variables are set
- Check `backend/server.js` for errors

### Frontend can't reach backend?
- Verify backend URL in frontend config
- Check CORS settings in backend
- Verify backend is running

### M-Pesa callbacks not working?
- Verify callback URL is correct
- Check backend logs for errors
- Verify M-Pesa credentials are correct

---

**Let me know which hosting you choose and I'll help you deploy! 🚀**

