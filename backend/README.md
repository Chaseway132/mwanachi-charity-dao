# Charity DAO Backend - Production Fork

Backend service for the Mwanachi Charity DAO production system. Handles M-Pesa payments, blockchain interactions, and real-time comments.

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `MPESA_CONSUMER_KEY` - From Safaricom Daraja API
- `MPESA_CONSUMER_SECRET` - From Safaricom Daraja API
- `MPESA_BUSINESS_SHORTCODE` - Your M-Pesa shortcode
- `MPESA_PASSKEY` - Your M-Pesa passkey
- `FIREBASE_*` - Firebase credentials
- `POLYGON_RPC_URL` - Polygon RPC endpoint
- `PRIVATE_KEY` - Your wallet private key (for relayer)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Server

```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### M-Pesa Integration

**POST** `/api/mpesa/stk-push`
- Initiates M-Pesa payment prompt
- Body: `{ phoneNumber, amount, accountReference, description }`

**POST** `/api/mpesa/callback`
- Receives M-Pesa payment callbacks
- Automatically called by Safaricom

**POST** `/api/mpesa/query-status`
- Check payment status
- Body: `{ checkoutRequestId }`

### Donations

**GET** `/api/donations`
- Get all donations

**POST** `/api/donations`
- Create donation record
- Body: `{ phoneNumber, amount, proposalId, donorName, mpesaTransactionId }`

**PATCH** `/api/donations/:id`
- Update donation status

### Proposals

**GET** `/api/proposals`
- Get all proposals

**POST** `/api/proposals`
- Create proposal
- Body: `{ title, description, amountRequested, recipientAddress, creatorPhone }`

**PATCH** `/api/proposals/:id`
- Update proposal status

### Comments

**GET** `/api/comments`
- Get all comments

**GET** `/api/comments/proposal/:proposalId`
- Get comments for a proposal

**POST** `/api/comments`
- Create comment
- Body: `{ proposalId, authorPhone, authorName, content }`

**PATCH** `/api/comments/:id`
- Update comment

**DELETE** `/api/comments/:id`
- Delete comment

### Blockchain

**POST** `/api/blockchain/record-donation`
- Record donation on blockchain

**POST** `/api/blockchain/create-proposal`
- Create proposal on blockchain

**POST** `/api/blockchain/vote`
- Record vote on blockchain

**GET** `/api/blockchain/tx-status/:txHash`
- Check transaction status

## 🔧 Configuration

### M-Pesa Setup

1. Register at https://developer.safaricom.co.ke/
2. Create an app
3. Get your credentials:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode
   - Passkey

4. Set environment to `sandbox` for testing, `production` for live

### Firebase Setup

1. Create Firebase project at https://console.firebase.google.com/
2. Download service account key
3. Add to `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

### Polygon Setup

1. Get RPC URL from https://polygon-rpc.com
2. Create wallet with private key
3. Add to `.env`:
   - `POLYGON_RPC_URL`
   - `PRIVATE_KEY`

## 📝 Next Steps

- [ ] Integrate Firebase for persistent storage
- [ ] Connect to smart contracts
- [ ] Add WebSocket for real-time updates
- [ ] Deploy to Render/Railway
- [ ] Set up monitoring and logging
- [ ] Add authentication
- [ ] Add rate limiting

## 🐛 Troubleshooting

**M-Pesa errors:**
- Check credentials in `.env`
- Verify phone number format (254XXXXXXXXX)
- Check M-Pesa environment (sandbox vs production)

**Blockchain errors:**
- Verify contract addresses
- Check wallet has enough gas
- Verify RPC URL is accessible

## 📚 Resources

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/apis)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Polygon Documentation](https://polygon.technology/developers)

