# 🚀 Mwanachi Charity DAO - Production Fork Setup Guide

## ✅ Phase 1 Complete: Backend Infrastructure

Your production backend is now ready! Here's what we've built:

### 📁 Backend Structure

```
backend/
├── server.js                 # Main Express server
├── package.json             # Dependencies
├── .env.example             # Environment template
├── README.md                # Backend documentation
└── routes/
    ├── mpesa.js             # M-Pesa STK Push integration
    ├── donations.js         # Donation management
    ├── proposals.js         # Proposal management
    ├── comments.js          # Real-time comments
    └── blockchain.js        # Blockchain interactions
```

### 🎯 What's Working Now

✅ **Express Server** - Running on port 5000
✅ **M-Pesa STK Push** - Ready for integration
✅ **Donation Tracking** - In-memory storage (will move to Firebase)
✅ **Proposal Management** - In-memory storage (will move to Firebase)
✅ **Comments System** - In-memory storage (will move to Firebase)
✅ **Blockchain Routes** - Ready for contract integration

### 📡 API Endpoints Available

**Health Check:**
```
GET http://localhost:5000/health
```

**M-Pesa:**
- `POST /api/mpesa/stk-push` - Initiate payment
- `POST /api/mpesa/callback` - Receive payment confirmation
- `POST /api/mpesa/query-status` - Check payment status

**Donations:**
- `GET /api/donations` - List all donations
- `POST /api/donations` - Create donation
- `PATCH /api/donations/:id` - Update donation

**Proposals:**
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create proposal
- `PATCH /api/proposals/:id` - Update proposal

**Comments:**
- `GET /api/comments` - List all comments
- `POST /api/comments` - Create comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

**Blockchain:**
- `POST /api/blockchain/record-donation` - Record on-chain
- `POST /api/blockchain/create-proposal` - Create on-chain
- `POST /api/blockchain/vote` - Vote on-chain
- `GET /api/blockchain/tx-status/:txHash` - Check status

---

## 🔧 Next Steps: Phase 2 - M-Pesa Integration

### What You Need to Do

1. **Get M-Pesa Daraja API Credentials**
   - Go to: https://developer.safaricom.co.ke/
   - Register your business
   - Create an app
   - Get credentials:
     - Consumer Key
     - Consumer Secret
     - Business Shortcode
     - Passkey

2. **Update `.env` File**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Fill in:
   ```
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_BUSINESS_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_ENVIRONMENT=sandbox  # Use 'sandbox' for testing
   BACKEND_URL=http://localhost:5000  # Will change when deployed
   ```

3. **Test M-Pesa STK Push**
   ```bash
   curl -X POST http://localhost:5000/api/mpesa/stk-push \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "254712345678",
       "amount": 100,
       "accountReference": "test-donation",
       "description": "Test donation"
     }'
   ```

---

## 🔐 Phase 3 - Firebase Integration

### Setup Firebase

1. Go to: https://console.firebase.google.com/
2. Create new project
3. Download service account key (JSON file)
4. Add to `.env`:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   ```

### What We'll Store in Firebase

- **Donations** - Persistent donation records
- **Proposals** - Proposal data with voting info
- **Comments** - Real-time comments with timestamps
- **Users** - Phone numbers, names, donation history
- **Transactions** - M-Pesa transaction logs

---

## ⛓️ Phase 4 - Blockchain Integration

### Smart Contracts to Connect

From your dissertation project:
- `CharityDAOPlatform` - Main coordinator
- `DonationTracking` - Record donations
- `ProposalManagement` - Create proposals
- `VotingGovernance` - Handle voting
- `FundAllocation` - Manage treasury

### Polygon Configuration

```
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_wallet_private_key
```

### What We'll Do

1. Load contract ABIs from your dissertation project
2. Create relayer service (backend signs transactions)
3. Users won't need MetaMask
4. Backend pays gas fees (very cheap on Polygon)

---

## 🌐 Phase 5 - Frontend Updates

### Changes Needed

1. **Remove MetaMask requirement**
   - Users login with phone number instead
   - Backend handles all blockchain interactions

2. **Add M-Pesa donation flow**
   - User enters phone number
   - User enters amount
   - Backend initiates STK Push
   - User enters PIN on phone
   - Donation recorded on blockchain

3. **Add real-time comments**
   - Comments stored in Firebase
   - Real-time updates via WebSocket
   - No blockchain needed for comments

4. **Update proposal creation**
   - User fills form
   - Backend creates on blockchain
   - No MetaMask needed

---

## 🚀 Phase 6 - Deployment

### Free Hosting Options

**Backend:**
- Render.com (free tier)
- Railway.app (free tier)
- Heroku (paid, but reliable)

**Frontend:**
- Vercel (free)
- Netlify (free)
- GitHub Pages (free)

**Database:**
- Firebase (free tier)
- Supabase (free tier)

### Deployment Steps

1. Push to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy
5. Update frontend API URLs

---

## 📋 Current Status

| Phase | Task | Status |
|-------|------|--------|
| 1 | Backend Setup | ✅ COMPLETE |
| 2 | M-Pesa Integration | ⏳ NEXT |
| 3 | Firebase Setup | ⏳ TODO |
| 4 | Blockchain Integration | ⏳ TODO |
| 5 | Frontend Updates | ⏳ TODO |
| 6 | Deployment | ⏳ TODO |

---

## 🎯 Immediate Action Items

1. **Get M-Pesa Credentials** (You do this)
   - Register at Safaricom Daraja
   - Get API keys

2. **Update `.env` File** (You do this)
   - Copy `.env.example` to `.env`
   - Fill in M-Pesa credentials

3. **Test M-Pesa** (We do together)
   - Test STK Push in sandbox
   - Verify callback handling

4. **Set Up Firebase** (We do together)
   - Create Firebase project
   - Connect to backend

---

## 💡 Key Differences from Dissertation Project

| Feature | Dissertation | Production |
|---------|-------------|-----------|
| Payment | Ethereum only | M-Pesa + Blockchain |
| User Auth | MetaMask wallet | Phone number |
| Gas Fees | User pays | Backend pays |
| Comments | None | Real-time database |
| Blockchain | Ganache testnet | Polygon mainnet |
| Backend | None | Node.js + Express |
| Database | None | Firebase |
| UX | Crypto-focused | Mobile-first (Kenya) |

---

## 🆘 Troubleshooting

**Backend won't start:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process on port 5000
taskkill /PID <PID> /F

# Try different port
PORT=3000 npm start
```

**M-Pesa errors:**
- Verify phone number format: `254XXXXXXXXX`
- Check credentials in `.env`
- Use sandbox environment for testing

**Firebase errors:**
- Verify service account JSON is valid
- Check project ID matches

---

## 📚 Resources

- [Safaricom Daraja API](https://developer.safaricom.co.ke/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Polygon Docs](https://polygon.technology/developers)
- [Express.js Guide](https://expressjs.com/)

---

## 🎉 You're Ready!

Your production backend is running. Next step: Get M-Pesa credentials and we'll integrate real payments!

Questions? Let me know! 🚀

