# 🚂 RAILWAY DEPLOYMENT GUIDE

## ✅ Railway - Free $5 Credit (No Payment Required)

Railway gives you a free $5/month credit - enough to run your backend for free!

---

## 🚀 STEP-BY-STEP SETUP

### **Step 1: Create Railway Account**

1. Go to https://railway.app
2. Click "Start Project"
3. Sign up with GitHub
4. Authorize Railway to access your repositories

---

### **Step 2: Create New Project**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Search for: `mwanachi-charity-dao`
4. Select your repository
5. Click "Deploy"

---

### **Step 3: Configure the Service**

Railway will auto-detect your project. You need to tell it to use the backend:

1. In Railway dashboard, click on your project
2. Click "Add Service" → "GitHub Repo"
3. Select the same repository
4. In the settings, set:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install`

---

### **Step 4: Set Environment Variables**

1. In Railway dashboard, go to your service
2. Click "Variables" tab
3. Add each variable:

**Variable 1: JWT_SECRET**
- Key: `JWT_SECRET`
- Value: `a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8`

**Variable 2: ADMIN_PASSWORD**
- Key: `ADMIN_PASSWORD`
- Value: `Charity@DAO2025!Secure`

**Variable 3: PORT**
- Key: `PORT`
- Value: `5000`

**Variable 4: NODE_ENV**
- Key: `NODE_ENV`
- Value: `production`

**Variable 5: BACKEND_URL** (Important!)
- Key: `BACKEND_URL`
- Value: `https://your-railway-url.railway.app`
- (You'll get this URL after deployment)

---

### **Step 5: Deploy**

1. Click "Deploy" button
2. Wait for deployment (2-5 minutes)
3. Check logs for any errors
4. Once deployed, you'll get a URL like: `https://mwanachi-charity-dao-backend-production.up.railway.app`

---

## ✅ Verify Backend is Working

Once deployed, test:

```
https://your-railway-url/health
```

Should return:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-23T..."
}
```

---

## 🔧 Update Frontend with Backend URL

Once backend is deployed:

### **File**: `charity-dao-frontend/src/config/index.ts`

Find and update:
```typescript
// BEFORE:
export const API_BASE_URL = 'http://localhost:3001';

// AFTER:
export const API_BASE_URL = 'https://your-railway-url.railway.app';
```

Then redeploy frontend:
```bash
cd charity-dao-frontend
npm run deploy
```

---

## 🎯 Environment Variables Summary

```
JWT_SECRET=a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
ADMIN_PASSWORD=Charity@DAO2025!Secure
PORT=5000
NODE_ENV=production
BACKEND_URL=https://your-railway-url.railway.app
```

---

## 📊 Current Status

```
✅ Frontend: LIVE at https://chaseway132.github.io/mwanachi-charity-dao/
⏳ Backend: Deploying to Railway
⏳ M-Pesa: Ready to test once backend is deployed
```

---

## 🚀 Next Steps

1. **Create Railway account** (free, no payment)
2. **Deploy backend** (2-5 minutes)
3. **Get backend URL**
4. **Update frontend** with backend URL
5. **Redeploy frontend**
6. **Test admin login**
7. **Test M-Pesa sandbox**

---

## 📞 Troubleshooting

### Backend won't start?
- Check logs in Railway dashboard
- Verify environment variables are set
- Check `backend/server.js` for errors

### Can't find backend URL?
- Go to Railway dashboard
- Click on your service
- Look for "Domains" section
- Copy the URL

### Frontend can't reach backend?
- Verify backend URL in frontend config
- Check CORS settings in backend
- Verify backend is running

---

## 💡 Tips

- Railway gives you **$5/month free credit**
- That's enough to run your backend for free
- No payment required unless you exceed $5/month
- You can monitor usage in Railway dashboard

---

**Ready? Let's deploy to Railway! 🚂🚀**

1. Go to https://railway.app
2. Sign up with GitHub
3. Follow the steps above
4. Let me know when you have the backend URL!

