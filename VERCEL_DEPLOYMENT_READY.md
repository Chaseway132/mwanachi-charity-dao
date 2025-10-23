# 🚀 VERCEL DEPLOYMENT - READY TO GO!

## ✅ Your JWT Secret is Set!

Your generated JWT secret has been added to `backend/.env`:
```
JWT_SECRET=528ace103443d836b4558f668285b57b362741b5a402aa6497575385e56421c9
```

---

## 🎯 VERCEL DEPLOYMENT STEPS

### **Step 1: Go to Vercel**
https://vercel.com

### **Step 2: Sign In with GitHub**
1. Click "Sign In"
2. Select "GitHub"
3. Authorize Vercel

### **Step 3: Create New Project**
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Search for: `mwanachi-charity-dao`
4. Click "Import"

### **Step 4: Configure Project**

**Project Settings:**
- **Project Name**: `mwanachi-charity-dao-backend`
- **Framework Preset**: Select "Other"
- **Root Directory**: Click "Edit" → Set to `backend`
- **Build Command**: `npm install`
- **Install Command**: `npm install`

### **Step 5: Add Environment Variables**

Click "Environment Variables" and add these:

```
JWT_SECRET=528ace103443d836b4558f668285b57b362741b5a402aa6497575385e56421c9
ADMIN_PASSWORD=Charity@DAO2025!Secure
PORT=3001
NODE_ENV=production
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9ba9b9d4edea5a426c7cc874b
```

### **Step 6: Deploy**
1. Click "Deploy" button
2. Wait 2-5 minutes
3. You'll see "Deployment Complete"
4. Your backend URL will be shown

---

## 📋 Environment Variables to Add

Copy and paste these into Vercel:

```
JWT_SECRET=528ace103443d836b4558f668285b57b362741b5a402aa6497575385e56421c9
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

## ✅ After Deployment

### **Test Backend**
Visit:
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

### **Get Your Backend URL**
1. Go to Vercel dashboard
2. Click on your project
3. Look for "Domains" section
4. Copy the URL (e.g., `https://mwanachi-charity-dao-backend.vercel.app`)

---

## 🔧 Update Frontend

Once backend is deployed:

**File**: `charity-dao-frontend/src/config/index.ts`

Change:
```typescript
export const API_BASE_URL = 'http://localhost:3001';
```

To:
```typescript
export const API_BASE_URL = 'https://your-vercel-url.vercel.app';
```

Then redeploy:
```bash
cd charity-dao-frontend
npm run deploy
```

---

## 📊 Current Status

```
✅ Frontend: LIVE at https://chaseway132.github.io/mwanachi-charity-dao/
✅ JWT Secret: Generated and configured
⏳ Backend: Ready to deploy to Vercel
⏳ M-Pesa: Ready to test once backend is deployed
```

---

## 🎯 Next Steps

1. Go to https://vercel.com
2. Sign in with GitHub
3. Create new project
4. Set root directory to `backend`
5. Add environment variables (copy from above)
6. Click "Deploy"
7. Wait 2-5 minutes
8. Get your backend URL
9. Tell me the URL and I'll update the frontend
10. Test admin login!

---

## 💡 Important Notes

- ✅ Your JWT secret is unique and secure
- ✅ All environment variables are ready
- ✅ M-Pesa sandbox credentials are configured
- ✅ Just follow the Vercel steps
- ✅ No payment required

---

**Ready? Go to https://vercel.com and deploy! 🚀**

**Once deployed, tell me your backend URL and I'll update the frontend!**

