# 🚀 VERCEL BACKEND DEPLOYMENT GUIDE

## ✅ Vercel - Perfect for Backend APIs

Vercel is great for deploying serverless backends! Much better UX than Replit.

---

## 🎯 STEP-BY-STEP SETUP

### **Step 1: Go to Vercel**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Authorize Vercel

---

### **Step 2: Create New Project**
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Search for: `mwanachi-charity-dao`
4. Select your repository
5. Click "Import"

---

### **Step 3: Configure Project**

In the "Configure Project" screen:

1. **Project Name**: `mwanachi-charity-dao-backend`
2. **Framework Preset**: Select "Other" (since it's Express.js)
3. **Root Directory**: Click "Edit" and set to `backend`
4. **Build Command**: `npm install`
5. **Output Directory**: Leave empty
6. **Install Command**: `npm install`

---

### **Step 4: Set Environment Variables**

1. Scroll down to "Environment Variables"
2. Add each variable:

**Variable 1:**
- Name: `JWT_SECRET`
- Value: `a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8`

**Variable 2:**
- Name: `ADMIN_PASSWORD`
- Value: `Charity@DAO2025!Secure`

**Variable 3:**
- Name: `PORT`
- Value: `3001`

**Variable 4:**
- Name: `NODE_ENV`
- Value: `production`

**Variable 5:**
- Name: `MPESA_ENVIRONMENT`
- Value: `sandbox`

**Variable 6:**
- Name: `MPESA_CONSUMER_KEY`
- Value: `2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz`

**Variable 7:**
- Name: `MPESA_CONSUMER_SECRET`
- Value: `wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq`

**Variable 8:**
- Name: `MPESA_BUSINESS_SHORTCODE`
- Value: `174379`

**Variable 9:**
- Name: `MPESA_PASSKEY`
- Value: `bfb279f9ba9b9d4edea5a426c7cc874b`

---

### **Step 5: Deploy**

1. Click "Deploy" button
2. Wait for deployment (2-5 minutes)
3. You'll see a success message
4. Get your URL: `https://mwanachi-charity-dao-backend.vercel.app`

---

## ✅ Verify Backend is Working

Once deployed, test:

```
https://your-vercel-url.vercel.app/health
```

Should return:
```json
{
  "status": "Backend is running",
  "timestamp": "..."
}
```

---

## 🔧 Update Frontend with Backend URL

Once backend is deployed:

**File**: `charity-dao-frontend/src/config/index.ts`

Find:
```typescript
export const API_BASE_URL = 'http://localhost:3001';
```

Replace with:
```typescript
export const API_BASE_URL = 'https://your-vercel-url.vercel.app';
```

Then redeploy frontend:
```bash
cd charity-dao-frontend
npm run deploy
```

---

## 📋 Environment Variables Summary

```
JWT_SECRET=a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
ADMIN_PASSWORD=Charity@DAO2025!Secure
PORT=3001
NODE_ENV=production
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
```

---

## 📊 Current Status

```
✅ Frontend: LIVE at https://chaseway132.github.io/mwanachi-charity-dao/
⏳ Backend: Deploying to Vercel
⏳ M-Pesa: Ready to test once backend is deployed
```

---

## 🎯 Next Steps

1. Go to https://vercel.com
2. Sign in with GitHub
3. Create new project
4. Set root directory to `backend`
5. Add environment variables
6. Click "Deploy"
7. Get your backend URL
8. Update frontend config
9. Redeploy frontend
10. Test admin login!

---

## 💡 Important Notes

- ✅ Vercel is free for hobby projects
- ✅ No payment required
- ✅ Great UX and dashboard
- ✅ Auto-deploys on GitHub push
- ✅ Perfect for serverless backends

---

## 🆘 Troubleshooting

### Backend won't start?
- Check Vercel logs in dashboard
- Verify environment variables are set
- Check `backend/server.js` for errors

### Can't find backend URL?
- Go to Vercel dashboard
- Click on your project
- Look for "Domains" section
- Copy the URL

### Frontend can't reach backend?
- Verify backend URL in frontend config
- Check CORS settings in backend
- Verify backend is running

---

**Ready? Let's deploy to Vercel! 🚀**

Go to https://vercel.com and follow the steps above!

