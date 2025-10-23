# 🔍 MongoDB Diagnostic Guide

## 🎯 Current Issue

- ✅ Admin dashboard shows "5 Campaigns Created"
- ❌ But only 1 campaign (Ojwang) appears in "Special Causes"
- ❌ API returns only 1 campaign

## 🔧 What We Did

Added debug logging to track:
1. MongoDB connection status
2. Campaign fetching from database
3. Campaign saving to database

## 📋 How to Check Render Logs

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Select your backend service

### Step 2: View Logs
1. Click "Logs" tab
2. Look for messages like:
   - `✅ MongoDB connected successfully`
   - `🔍 Fetching from MongoDB...`
   - `📦 Using in-memory campaigns...`

### Step 3: Interpret the Logs

**If you see:**
```
✅ MongoDB connected successfully
🔍 Fetching from MongoDB...
✅ MongoDB campaigns found: 5
```
→ **MongoDB is working!** Campaigns should appear.

**If you see:**
```
❌ MongoDB connection failed
📦 Using in-memory campaigns: 1
```
→ **MongoDB not connected.** Using fallback memory storage.

---

## 🧪 Test Steps (After Render Restarts)

### Step 1: Check Backend Health
```bash
curl https://mwanachi-charity-dao-backend.onrender.com/health
```

Should return: `{"status":"ok"}`

### Step 2: Check Campaigns API
```bash
curl https://mwanachi-charity-dao-backend.onrender.com/api/special-donations
```

Look for:
- `"total": 5` (or however many you created)
- `"storage": "MongoDB"` (should say MongoDB, not Memory)

### Step 3: Check Render Logs
1. Go to Render dashboard
2. Click "Logs"
3. Look for debug messages

---

## 🐛 Possible Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Symptoms:**
- Logs show: `❌ MongoDB connection failed`
- API shows: `"storage": "Memory"`
- Only 1 campaign appears

**Solutions:**
1. Check MONGODB_URI in Render environment
2. Verify connection string format
3. Check MongoDB Atlas cluster is running
4. Verify IP whitelist in MongoDB Atlas

### Issue 2: Campaigns Not Saved to MongoDB
**Symptoms:**
- Logs show: `📦 Saving campaign to memory`
- Not: `💾 Saving campaign to MongoDB`

**Solutions:**
1. MongoDB not connected
2. Check connection string
3. Check credentials

### Issue 3: Campaigns Saved but Not Fetched
**Symptoms:**
- Logs show: `✅ Campaign saved to MongoDB`
- But: `📦 Using in-memory campaigns: 1`

**Solutions:**
1. MongoDB connection lost after save
2. Check network connectivity
3. Check MongoDB Atlas status

---

## 📊 Expected Log Output

### On Startup
```
🔄 Connecting to MongoDB...
📍 URI: mongodb+srv://mwanachi_admin:****@cluster0.9ihsbgm.mongodb.net/...
✅ MongoDB connected successfully
✅ Mongoose connected to MongoDB
```

### When Creating Campaign
```
💾 Saving campaign to MongoDB: Test Campaign
✅ Campaign saved to MongoDB: 2
```

### When Fetching Campaigns
```
📊 GET /api/special-donations - MongoDB connected: true
🔍 Fetching from MongoDB...
✅ MongoDB campaigns found: 5
📊 Fetched campaigns count: 5
```

---

## 🚀 Next Steps

### Immediate (Do This Now)
1. Wait for Render to restart (1-2 minutes)
2. Go to Render logs
3. Look for debug messages
4. Share what you see

### If MongoDB Connected
1. Create a new campaign
2. Check "Special Causes"
3. Campaign should appear ✅

### If MongoDB Not Connected
1. Check MONGODB_URI in Render environment
2. Verify connection string
3. Check MongoDB Atlas cluster status
4. Restart backend

---

## 📞 What to Share

When troubleshooting, please share:
1. **Render logs** (last 20 lines)
2. **API response** from `/api/special-donations`
3. **Storage type** (MongoDB or Memory)
4. **Campaign count** in admin dashboard

---

## 🎯 Success Indicators

✅ **All Good:**
- Logs show: `✅ MongoDB connected successfully`
- API shows: `"storage": "MongoDB"`
- API shows: `"total": 5` (or your campaign count)
- "Special Causes" shows all campaigns

❌ **Problem:**
- Logs show: `❌ MongoDB connection failed`
- API shows: `"storage": "Memory"`
- API shows: `"total": 1` (only default)
- "Special Causes" shows only Ojwang

---

## 🔄 Render Auto-Deployment

Your code was just pushed. Render will:
1. Pull latest code from GitHub
2. Install dependencies
3. Restart backend
4. Show new logs

**Wait 1-2 minutes for restart.**

---

## 📝 Debug Checklist

- [ ] Render backend restarted
- [ ] Checked Render logs
- [ ] Saw MongoDB connection message
- [ ] Tested `/api/special-donations` endpoint
- [ ] Checked storage type (MongoDB or Memory)
- [ ] Checked campaign count
- [ ] Created new campaign
- [ ] Checked "Special Causes" for new campaign
- [ ] Verified campaign appears

---

**Let me know what you see in the Render logs! 🚀**

