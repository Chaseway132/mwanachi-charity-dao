# 🚀 Quick Backend Testing - Render Deployment

## ✅ Your Backend is on Render!

Great! You deployed the backend to Render yesterday. Now let's test it!

---

## 🎯 Quick Test (2 minutes)

### Step 1: Find Your Render URL

Go to: https://dashboard.render.com
- Click on your backend service
- Copy the URL (looks like: `https://mwanachi-charity-dao-backend.onrender.com`)

### Step 2: Test Health Check

Open your browser and visit:
```
https://your-render-url/health
```

You should see:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-23T..."
}
```

✅ If you see this, your backend is working!

---

## 🧪 Comprehensive Testing (5 minutes)

### Run Automated Tests

```bash
# From root directory
cd backend
RENDER_URL=https://your-render-url node test-render-backend.js
```

Replace `https://your-render-url` with your actual Render URL.

### Expected Output

```
======================================================================
  🚀 TESTING RENDER BACKEND
======================================================================

Backend URL: https://your-render-url

▶ Health Check
   Status: Backend is running
✅ PASSED

▶ Test Route
   Message: Test route works!
✅ PASSED

▶ Create Donation
   Donation ID: donation_1729516800000
✅ PASSED

... (more tests)

======================================================================
📋 TEST SUMMARY
======================================================================

✅ Tests Completed!
   Total: 8
   Passed: 8
   Failed: 0

🎉 All tests passed! Backend is working correctly!
```

---

## 📊 What Gets Tested

✅ **Health Check** - Backend is running
✅ **Test Route** - API is responding
✅ **Create Donation** - Can record donations
✅ **Get Donations** - Can retrieve donations
✅ **Create Comment** - Can create comments
✅ **Get Comments** - Can retrieve comments
✅ **Track Analytics** - Analytics tracking works
✅ **Blockchain Recording** - Can record on blockchain

---

## 🔧 Troubleshooting

### ❌ "Cannot reach backend"
```
Error: connect ECONNREFUSED
```
**Solution:**
1. Check Render dashboard - is service running?
2. Verify URL is correct
3. Check Render logs for errors

### ❌ "CORS error"
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Backend has CORS enabled (already configured)
- Check frontend URL is whitelisted

### ❌ "M-Pesa error"
```
Error: Invalid credentials
```
**Solution:**
- M-Pesa credentials are in backend/.env
- Using sandbox environment
- Phone format: 254XXXXXXXXX

---

## 📝 Next Steps After Testing

### 1. Update Frontend with Backend URL

**File:** `charity-dao-frontend/src/utils/api.ts` (or similar)

Find:
```typescript
const API_BASE_URL = 'http://localhost:5000';
```

Replace with:
```typescript
const API_BASE_URL = 'https://your-render-url';
```

### 2. Redeploy Frontend

```bash
cd charity-dao-frontend
npm run deploy
```

### 3. Test M-Pesa Integration

```bash
node backend/test-mpesa-integration.js
```

### 4. Test Polygon Blockchain

```bash
node backend/test-blockchain.js
```

---

## 🎯 Your Render Backend URL

**Please provide your Render URL:**
```
https://your-service-name.onrender.com
```

Once you provide it, I can:
1. ✅ Run comprehensive tests
2. ✅ Verify M-Pesa integration
3. ✅ Test Polygon blockchain
4. ✅ Update frontend configuration
5. ✅ Generate detailed test report

---

## 📞 Quick Commands

```bash
# Test health
curl https://your-render-url/health

# Test API
curl https://your-render-url/api/test

# Create donation
curl -X POST https://your-render-url/api/donations \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"254712345678","amount":100,"donorName":"Test"}'

# Get donations
curl https://your-render-url/api/donations
```

---

## ✨ Status

- ✅ Frontend: LIVE at https://chaseway132.github.io/mwanachi-charity-dao/
- ✅ Backend: DEPLOYED on Render
- ⏳ Testing: Ready to run
- ⏳ M-Pesa: Ready to test
- ⏳ Polygon: Ready to test

**What's next?** Provide your Render URL and we'll test everything! 🚀

