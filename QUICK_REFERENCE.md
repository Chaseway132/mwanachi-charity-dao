# 🚀 Quick Reference Card

## 📍 Current Status
- **Phase:** 1 Complete ✅ | 2 In Progress ⏳
- **Backend:** Running on port 5000 ✅
- **M-Pesa:** Ready for credentials ⏳
- **Overall:** 17% Complete

---

## 🎯 What You Need to Do NOW

### Step 1: Get M-Pesa Credentials (THIS WEEK)
```
Go to: https://developer.safaricom.co.ke/
Register → Create App → Get Credentials
```

### Step 2: Update `.env` File
```bash
cd backend
cp .env.example .env
# Edit with your M-Pesa credentials
```

### Step 3: Test Backend
```bash
npm start
# Should see: "🚀 Backend server running on port 5000"
```

### Step 4: Test M-Pesa
```bash
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254712345678", "amount": 100}'
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Main backend server |
| `backend/.env` | Your credentials (create from .env.example) |
| `backend/routes/mpesa.js` | M-Pesa integration |
| `PRODUCTION_SETUP_GUIDE.md` | Complete setup guide |
| `PHASE_2_CHECKLIST.md` | M-Pesa checklist |
| `backend/API_TESTING.md` | API testing examples |

---

## 🔧 Backend Commands

```bash
# Start backend
cd backend
npm start

# Test health check
curl http://localhost:5000/health

# Test M-Pesa STK Push
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "accountReference": "test",
    "description": "Test donation"
  }'

# Get all donations
curl http://localhost:5000/api/donations

# Get all proposals
curl http://localhost:5000/api/proposals

# Get all comments
curl http://localhost:5000/api/comments
```

---

## 📡 API Endpoints

### M-Pesa
- `POST /api/mpesa/stk-push` - Initiate payment
- `POST /api/mpesa/callback` - Receive confirmation
- `POST /api/mpesa/query-status` - Check status

### Donations
- `GET /api/donations` - List all
- `POST /api/donations` - Create
- `PATCH /api/donations/:id` - Update

### Proposals
- `GET /api/proposals` - List all
- `POST /api/proposals` - Create
- `PATCH /api/proposals/:id` - Update

### Comments
- `GET /api/comments` - List all
- `POST /api/comments` - Create
- `PATCH /api/comments/:id` - Update
- `DELETE /api/comments/:id` - Delete

### Blockchain
- `POST /api/blockchain/record-donation` - Record on-chain
- `POST /api/blockchain/create-proposal` - Create on-chain
- `POST /api/blockchain/vote` - Vote on-chain
- `GET /api/blockchain/tx-status/:txHash` - Check status

---

## 🎯 M-Pesa Credentials You Need

```
MPESA_CONSUMER_KEY=your_key_here
MPESA_CONSUMER_SECRET=your_secret_here
MPESA_BUSINESS_SHORTCODE=your_shortcode_here
MPESA_PASSKEY=your_passkey_here
MPESA_ENVIRONMENT=sandbox  # Use 'sandbox' for testing
```

---

## 🧪 Test Scenarios

### Test 1: Create Donation
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "donorName": "John Doe"
  }'
```

### Test 2: Create Proposal
```bash
curl -X POST http://localhost:5000/api/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build Water Well",
    "description": "Water well for 500 families",
    "amountRequested": 5000,
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
  }'
```

### Test 3: Create Comment
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "proposalId": "proposal_123",
    "authorName": "Jane Smith",
    "content": "Great initiative!"
  }'
```

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Try different port
PORT=3000 npm start
```

### M-Pesa errors?
- Check credentials in `.env`
- Verify phone format: `254XXXXXXXXX`
- Use sandbox environment

### API not responding?
- Verify backend is running
- Check port 5000 is accessible
- Check CORS is enabled

---

## 📊 Architecture Overview

```
User Phone
    ↓
React App
    ↓
Backend (Express)
    ├→ M-Pesa API
    ├→ Firebase (Phase 3)
    └→ Polygon Blockchain (Phase 4)
```

---

## 🎯 Next Phases

| Phase | What | When |
|-------|------|------|
| 1 | Backend Setup | ✅ DONE |
| 2 | M-Pesa Integration | ⏳ THIS WEEK |
| 3 | Firebase Setup | Week 4-5 |
| 4 | Blockchain Connect | Week 6-7 |
| 5 | Frontend Update | Week 8-9 |
| 6 | Deploy to Production | Week 10 |

---

## 📞 Quick Help

**Backend not running?**
→ Check `PRODUCTION_SETUP_GUIDE.md`

**M-Pesa not working?**
→ Check `PHASE_2_CHECKLIST.md`

**API testing?**
→ Check `backend/API_TESTING.md`

**General questions?**
→ Check `KICKSTART_SUMMARY.md`

---

## ✅ Checklist

- [ ] Backend running on port 5000
- [ ] Health check works
- [ ] M-Pesa credentials obtained
- [ ] `.env` file updated
- [ ] STK Push tested
- [ ] Ready for Phase 3

---

## 🚀 You're Ready!

Everything is set up. Just get M-Pesa credentials and we'll make real payments work!

**Let's build something amazing for Kenya! 🎉**

