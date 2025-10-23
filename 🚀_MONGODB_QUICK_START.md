# 🚀 MongoDB Quick Start - 10 Minutes

## ⏱️ Time: 10 minutes to persistent data!

---

## 🎯 Goal

Make campaigns persist forever (survive backend restarts)

---

## 📋 Quick Setup (MongoDB Atlas)

### Step 1: Create Account (2 min)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Sign Up"
3. Enter email and password
4. Verify email

### Step 2: Create Cluster (3 min)
1. Click "Create" → "Build a Database"
2. Select "Free" tier
3. Cloud: AWS
4. Region: us-east-1
5. Click "Create Cluster"
6. Wait for cluster to be ready

### Step 3: Create User (2 min)
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `mwanachi_admin`
4. Password: Generate (save it!)
5. Click "Add User"

### Step 4: Allow Access (1 min)
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Click "Confirm"

### Step 5: Get Connection String (1 min)
1. Go to "Databases"
2. Click "Connect"
3. Select "Drivers"
4. Copy connection string
5. Replace `<username>` and `<password>`

**Example:**
```
mongodb+srv://mwanachi_admin:YOUR_PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
```

### Step 6: Update .env (1 min)
```bash
# Open: backend/.env
# Find: MONGODB_URI=mongodb://localhost:27017/mwanachi-charity-dao
# Replace with your connection string:
MONGODB_URI=mongodb+srv://mwanachi_admin:YOUR_PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
```

---

## 🔄 Deploy to Render

### Step 1: Update Render Environment
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to "Environment"
4. Add new variable:
   ```
   MONGODB_URI=mongodb+srv://mwanachi_admin:YOUR_PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
   ```
5. Click "Save Changes"
6. Backend restarts automatically

### Step 2: Verify Connection
```bash
curl https://your-render-url/health
# Should return: {"status":"ok"}
```

---

## 🧪 Test It Works

### Test 1: Create Campaign
1. Go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Click "Admin"
3. Login: `admin` / `admin123`
4. Click "Create New Campaign"
5. Fill form and submit
6. Go to "Special Causes"
7. ✅ Campaign appears

### Test 2: Verify Persistence
1. Restart backend on Render
2. Go to "Special Causes"
3. ✅ Campaign still there!

---

## ✅ Success Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Connection string copied
- [ ] .env file updated
- [ ] Render environment variable added
- [ ] Backend restarted
- [ ] Campaign created
- [ ] Campaign persists after restart

---

## 🎉 Result

**Before:**
- ❌ Campaigns lost on restart
- ❌ Not production-ready

**After:**
- ✅ Campaigns persist forever
- ✅ Production-ready
- ✅ Scalable

---

## 🆘 Troubleshooting

### Connection Failed
```
Error: connect ECONNREFUSED
```
**Fix:** Check MONGODB_URI in .env and Render environment

### Still Showing "Memory" Storage
```
curl https://your-render-url/api/special-donations
# Look for: "storage": "MongoDB"
```
**Fix:** 
1. Check Render logs
2. Verify MONGODB_URI environment variable
3. Restart backend

### Wrong Password
```
Error: authentication failed
```
**Fix:** 
1. Go to MongoDB Atlas
2. Reset password
3. Update .env and Render

---

## 📚 Full Documentation

See: `🗄️_MONGODB_SETUP_GUIDE.md` for detailed setup

---

## 🚀 Let's Go!

1. Create MongoDB Atlas account
2. Get connection string
3. Update .env
4. Deploy to Render
5. Test campaign creation
6. ✅ Done!

**Your campaigns will now persist forever! 💚**

