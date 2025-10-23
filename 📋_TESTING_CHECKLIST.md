# 📋 Backend Testing Checklist

## 🎯 Current Status: READY TO TEST

```
✅ Frontend: LIVE & RESPONSIVE
✅ Backend: DEPLOYED on Render
✅ M-Pesa: Configured (sandbox)
✅ Polygon: Configured & deployed
✅ Testing: Ready to run
```

---

## 📝 Your Action Items

### [ ] 1. Get Render URL (1 minute)
- [ ] Go to https://dashboard.render.com
- [ ] Click on your backend service
- [ ] Copy the URL
- [ ] Format: `https://your-service-name.onrender.com`

### [ ] 2. Quick Health Check (1 minute)
```bash
curl https://your-render-url/health
```
- [ ] Should return: `{"status": "Backend is running", ...}`
- [ ] If fails: Check Render dashboard

### [ ] 3. Run Comprehensive Tests (5 minutes)
```bash
cd backend
RENDER_URL=https://your-render-url node test-render-backend.js
```
- [ ] Health Check: PASSED
- [ ] Test Route: PASSED
- [ ] Create Donation: PASSED
- [ ] Get Donations: PASSED
- [ ] Create Comment: PASSED
- [ ] Get Comments: PASSED
- [ ] Track Analytics: PASSED
- [ ] Blockchain Recording: PASSED

### [ ] 4. Test M-Pesa Integration (5 minutes)
```bash
node test-mpesa-integration.js
```
- [ ] STK Push: PASSED
- [ ] Query Status: PASSED
- [ ] Callback Simulation: PASSED
- [ ] Donation Recording: PASSED
- [ ] Blockchain Recording: PASSED

### [ ] 5. Update Frontend (2 minutes)
```bash
# Edit: charity-dao-frontend/src/utils/api.ts
# Change: const API_BASE_URL = 'http://localhost:5000';
# To: const API_BASE_URL = 'https://your-render-url';

cd charity-dao-frontend
npm run deploy
```
- [ ] Frontend updated
- [ ] Frontend redeployed
- [ ] Frontend connects to backend

---

## 🧪 Test Results Template

### Backend API Tests
```
✅ Health Check: PASSED
✅ Test Route: PASSED
✅ Create Donation: PASSED
✅ Get Donations: PASSED
✅ Create Comment: PASSED
✅ Get Comments: PASSED
✅ Track Analytics: PASSED
✅ Blockchain Recording: PASSED

Total: 8/8 PASSED
```

### M-Pesa Integration Tests
```
✅ STK Push Initiation: PASSED
✅ Query Payment Status: PASSED
✅ Callback Simulation: PASSED
✅ Donation Recording: PASSED
✅ Blockchain Recording: PASSED

Total: 5/5 PASSED
```

### Frontend Integration Tests
```
✅ Frontend connects to backend
✅ Can create donations
✅ Can create comments
✅ Admin login works
✅ Analytics tracked

Total: 5/5 PASSED
```

---

## 🔧 Troubleshooting Checklist

### If Backend Not Responding
- [ ] Check Render dashboard - is service running?
- [ ] Check Render logs for errors
- [ ] Verify URL is correct
- [ ] Try health check: `curl https://your-render-url/health`

### If CORS Errors
- [ ] Backend has CORS enabled (check server.js)
- [ ] Frontend URL is whitelisted
- [ ] Check browser console for exact error

### If M-Pesa Errors
- [ ] Check credentials in backend/.env
- [ ] Verify sandbox environment
- [ ] Check phone number format: 254XXXXXXXXX
- [ ] Check M-Pesa callback URL

### If Polygon Errors
- [ ] Verify RPC URL is accessible
- [ ] Check contract addresses
- [ ] Verify private key is set
- [ ] Check wallet has gas

---

## 📊 Testing Documents

| Document | Purpose | Time |
|----------|---------|------|
| 🎯_BACKEND_TESTING_ACTION_PLAN.md | Overview & next steps | 2 min |
| QUICK_BACKEND_TEST.md | Quick health check | 2 min |
| BACKEND_TESTING_GUIDE.md | Comprehensive guide | 5 min |
| MPESA_POLYGON_TESTING.md | M-Pesa & Polygon | 10 min |
| BACKEND_TESTING_SUMMARY.md | Summary & checklist | 5 min |

---

## 🚀 Quick Commands

```bash
# Test health
curl https://your-render-url/health

# Run comprehensive tests
cd backend
RENDER_URL=https://your-render-url node test-render-backend.js

# Test M-Pesa
node test-mpesa-integration.js

# Update frontend
cd ../charity-dao-frontend
npm run deploy

# Check frontend
open https://chaseway132.github.io/mwanachi-charity-dao/
```

---

## ✅ Success Criteria

### All Tests Pass ✅
- [ ] 8/8 API tests pass
- [ ] 5/5 M-Pesa tests pass
- [ ] 5/5 Frontend tests pass
- [ ] No errors in console
- [ ] No errors in Render logs

### Backend Ready ✅
- [ ] Health check responds
- [ ] All endpoints work
- [ ] M-Pesa integration works
- [ ] Blockchain integration works
- [ ] Frontend connects

### Production Ready ✅
- [ ] All tests pass
- [ ] No errors
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready to deploy

---

## 📝 Test Execution Log

### Date: 2025-10-23

**Step 1: Health Check**
```
Status: [ ] Not Started [ ] In Progress [✓] Complete
Result: [ ] Pass [ ] Fail
```

**Step 2: Comprehensive Tests**
```
Status: [ ] Not Started [ ] In Progress [ ] Complete
Result: [ ] Pass [ ] Fail
```

**Step 3: M-Pesa Tests**
```
Status: [ ] Not Started [ ] In Progress [ ] Complete
Result: [ ] Pass [ ] Fail
```

**Step 4: Frontend Update**
```
Status: [ ] Not Started [ ] In Progress [ ] Complete
Result: [ ] Pass [ ] Fail
```

**Step 5: Final Verification**
```
Status: [ ] Not Started [ ] In Progress [ ] Complete
Result: [ ] Pass [ ] Fail
```

---

## 🎯 Next Steps

1. **Provide Render URL** ← YOU ARE HERE
2. Run health check
3. Run comprehensive tests
4. Test M-Pesa integration
5. Update frontend
6. Verify everything works
7. Deploy to production

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Review QUICK_BACKEND_TEST.md
3. Check Render dashboard logs
4. Verify environment variables
5. Review backend/server.js

---

## 🎉 Ready?

**Provide your Render URL and let's test everything!**

```
Your Render Backend URL:
https://_____________________________.onrender.com
```

I'll run all tests and get you a complete report! 🚀

