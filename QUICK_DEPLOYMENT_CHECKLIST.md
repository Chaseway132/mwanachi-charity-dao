# ⚡ Quick Deployment Checklist - 10 Minutes to Live!

## 🎯 Deploy Your App in 10 Minutes

### **STEP 1: Deploy Frontend to Vercel (5 minutes)**

- [ ] Go to: https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Paste: `https://github.com/Chaseway132/mwanachi-charity-dao`
- [ ] Click "Import"
- [ ] **Root Directory:** `charity-dao-frontend`
- [ ] Click "Deploy"
- [ ] ✅ Wait for deployment (2-3 minutes)
- [ ] Copy your URL: `https://your-project.vercel.app`

**Result:** Frontend is LIVE! 🎉

---

### **STEP 2: Deploy Backend to Railway (5 minutes)**

- [ ] Go to: https://railway.app
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Select your repository
- [ ] **Directory:** `backend`
- [ ] Click "Deploy"
- [ ] Add environment variables:

```
PORT=5000
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://your-backend.railway.app/api/mpesa/callback
REACT_APP_PINATA_JWT=your_pinata_jwt_here
```

- [ ] ✅ Wait for deployment (2-3 minutes)
- [ ] Copy your URL: `https://your-backend.railway.app`

**Result:** Backend is LIVE! 🎉

---

### **STEP 3: Connect Frontend to Backend (1 minute)**

- [ ] Go to Vercel dashboard
- [ ] Select your project
- [ ] Go to Settings → Environment Variables
- [ ] Add:
  ```
  REACT_APP_API_URL=https://your-backend.railway.app
  ```
- [ ] Redeploy (automatic on next push)

**Result:** Frontend and Backend connected! 🎉

---

### **STEP 4: Test Everything (1 minute)**

- [ ] Open: `https://your-project.vercel.app`
- [ ] Check if page loads
- [ ] Try making a donation
- [ ] Check Special Causes tab
- [ ] Verify API calls work

**Result:** Everything works! 🎉

---

## 📊 **YOUR LIVE URLS**

After deployment, you'll have:

```
Frontend:  https://your-project.vercel.app
Backend:   https://your-backend.railway.app
GitHub:    https://github.com/Chaseway132/mwanachi-charity-dao
```

---

## 🔐 **ENVIRONMENT VARIABLES NEEDED**

### **For Railway Backend:**

```
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-backend.railway.app/api/mpesa/callback

# IPFS Configuration
REACT_APP_PINATA_JWT=your_jwt

# Server Configuration
PORT=5000
```

### **For Vercel Frontend:**

```
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_PINATA_JWT=your_jwt
```

---

## 🚀 **DEPLOYMENT FLOW**

```
1. Push to GitHub
   ↓
2. Vercel auto-deploys frontend
   ↓
3. Railway auto-deploys backend
   ↓
4. Frontend connects to backend
   ↓
5. Your app is LIVE! 🎉
```

---

## ✅ **VERIFICATION CHECKLIST**

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds at Railway URL
- [ ] Dashboard displays correctly
- [ ] Can view campaigns
- [ ] Can make donations
- [ ] Special Causes tab works
- [ ] Real-time updates work
- [ ] No console errors

---

## 💡 **TROUBLESHOOTING**

### **Frontend not loading?**
- Check Vercel build logs
- Verify environment variables
- Check for build errors

### **Backend not responding?**
- Check Railway logs
- Verify environment variables
- Check if PORT is set to 5000

### **API calls failing?**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Check Railway backend is running

### **M-Pesa not working?**
- Verify credentials in Railway
- Check callback URL is correct
- Test with M-Pesa sandbox

---

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Share the URL** with your team
2. **Test with real M-Pesa** (if credentials ready)
3. **Deploy smart contracts** to Polygon
4. **Add database** (PostgreSQL on Railway)
5. **Buy domain** and connect it
6. **Set up monitoring** (optional)

---

## 📱 **SHARE YOUR LIVE APP**

Once deployed, share:

```
🌐 Frontend: https://your-project.vercel.app
🔗 Backend: https://your-backend.railway.app
📦 GitHub: https://github.com/Chaseway132/mwanachi-charity-dao
```

---

## ⏱️ **TIMELINE**

| Step | Time | Status |
|------|------|--------|
| Deploy Frontend | 5 min | ⏳ |
| Deploy Backend | 5 min | ⏳ |
| Connect & Test | 1 min | ⏳ |
| **TOTAL** | **~10 min** | 🎉 |

---

## 🎉 **YOU'RE READY!**

Your Mwanachi Charity DAO will be LIVE in 10 minutes!

**Let's go!** 🚀

---

## 📞 **NEED HELP?**

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **GitHub Integration:** Both platforms auto-connect to GitHub

---

**Start deployment now!** ⚡

