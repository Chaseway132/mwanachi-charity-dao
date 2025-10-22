# 🚀 Production Deployment Quick Reference

## 📋 Pre-Deployment Checklist

### Environment Setup
```bash
# 1. Create production .env file
cp .env.example .env.production

# 2. Fill in production values:
PRIVATE_KEY=your_production_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_key
MPESA_CONSUMER_KEY=production_key
MPESA_CONSUMER_SECRET=production_secret
MPESA_BUSINESS_SHORTCODE=production_shortcode
MPESA_PASSKEY=production_passkey
MPESA_ENVIRONMENT=production
DATABASE_URL=your_firebase_or_mongodb_url
```

### Wallet Preparation
```bash
# 1. Create a new wallet for production (DO NOT use testnet wallet)
# 2. Fund it with MATIC for gas fees (start with 10 MATIC)
# 3. Store private key securely (use hardware wallet if possible)
# 4. Never commit private key to git
```

---

## 🔗 Smart Contract Deployment

### Step 1: Compile Contracts
```bash
npx hardhat compile
```

### Step 2: Deploy to Polygon Mainnet
```bash
# First, test on Mumbai testnet
npx hardhat run scripts/deploy-all-new.js --network mumbai

# Then deploy to mainnet
npx hardhat run scripts/deploy-all-new.js --network polygon
```

### Step 3: Verify Contracts on PolygonScan
```bash
# Get contract addresses from deployment output
# Then verify each contract:

npx hardhat verify --network polygon <ADDRESS> <CONSTRUCTOR_ARGS>
```

### Step 4: Save Deployed Addresses
```bash
# Copy addresses to:
# 1. frontend/src/config/deployedAddresses.ts
# 2. backend/.env
# 3. deployedAddresses.json (for reference)
```

---

## 🗄️ Database Setup

### Option 1: Firebase (Recommended for MVP)
```bash
# 1. Go to https://firebase.google.com/
# 2. Create new project
# 3. Enable Realtime Database
# 4. Get connection string
# 5. Add to .env: DATABASE_URL=your_firebase_url
```

### Option 2: MongoDB Atlas
```bash
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Get connection string
# 4. Add to .env: DATABASE_URL=mongodb+srv://...
```

### Database Schema
```javascript
// Donations
{
  id: string,
  donorPhone: string,
  amount: number,
  currency: 'KES' | 'MATIC',
  paymentMethod: 'mpesa' | 'crypto',
  mpesaTransactionId: string,
  blockchainTxHash: string,
  status: 'pending' | 'completed' | 'failed',
  timestamp: Date
}

// Proposals
{
  id: string,
  title: string,
  description: string,
  recipient: string,
  amount: number,
  status: 'pending' | 'approved' | 'executed',
  votes: { for: number, against: number },
  createdAt: Date,
  executedAt: Date
}

// Comments
{
  id: string,
  proposalId: string,
  author: string,
  content: string,
  createdAt: Date
}
```

---

## 📱 M-Pesa Production Setup

### Get Production Credentials
1. Go to https://developer.safaricom.co.ke/
2. Register business account
3. Create production app
4. Get:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode
   - Passkey

### Update Backend
```javascript
// backend/.env
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
```

### Test M-Pesa Integration
```bash
# 1. Start backend
cd backend && npm start

# 2. Test STK Push
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100
  }'

# 3. Verify callback handling
# M-Pesa will send callback to your configured URL
```

---

## 🌐 Backend Deployment

### Option 1: AWS EC2
```bash
# 1. Launch Ubuntu 22.04 instance
# 2. SSH into instance
# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone repo and install
git clone <your-repo>
cd backend
npm install

# 5. Set environment variables
nano .env

# 6. Start with PM2
npm install -g pm2
pm2 start server.js --name "charity-dao"
pm2 startup
pm2 save
```

### Option 2: Heroku
```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create charity-dao-backend

# 4. Set environment variables
heroku config:set PRIVATE_KEY=xxx
heroku config:set POLYGON_RPC_URL=xxx
# ... set all variables

# 5. Deploy
git push heroku main
```

### Option 3: Railway/Render
- Similar to Heroku
- Connect GitHub repo
- Set environment variables
- Auto-deploy on push

---

## 🎨 Frontend Deployment

### Build Production Bundle
```bash
cd charity-dao-frontend
npm run build
```

### Deploy to Vercel (Recommended)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel dashboard
REACT_APP_BACKEND_URL=https://your-backend.com
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
```

### Deploy to Netlify
```bash
# 1. Connect GitHub repo to Netlify
# 2. Set build command: npm run build
# 3. Set publish directory: build
# 4. Set environment variables
# 5. Deploy
```

---

## 🔒 Security Hardening

### Backend Security
```javascript
// Add to server.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet()); // Security headers
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Environment Variables
- Never commit .env to git
- Use .env.example as template
- Rotate credentials regularly
- Use secrets manager (AWS Secrets Manager, etc.)

### HTTPS/SSL
- Use Let's Encrypt for free SSL
- Enforce HTTPS redirect
- Set HSTS headers

---

## 📊 Monitoring & Logging

### Add Logging
```bash
npm install winston
```

### Add Error Tracking
```bash
npm install @sentry/node
```

### Monitor Blockchain
- Set up PolygonScan alerts
- Monitor contract interactions
- Track gas prices

---

## 🧪 Testing Before Launch

### 1. End-to-End Testing
```bash
# Test complete donation flow
# Test proposal creation and voting
# Test M-Pesa integration
# Test blockchain recording
```

### 2. Load Testing
```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://your-backend.com/health
```

### 3. Security Testing
```bash
# Run OWASP ZAP
# Test for SQL injection
# Test for XSS vulnerabilities
# Test for CSRF protection
```

---

## 🚀 Launch Day

### Pre-Launch (1 hour before)
- [ ] Verify all services running
- [ ] Check database connectivity
- [ ] Verify M-Pesa integration
- [ ] Check blockchain connection
- [ ] Monitor logs for errors

### Launch
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Update DNS if needed
- [ ] Announce to users

### Post-Launch (First 24 hours)
- [ ] Monitor error rates
- [ ] Check transaction success rates
- [ ] Monitor server performance
- [ ] Be ready to rollback if needed

---

## 📞 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs charity-dao

# Check port
lsof -i :5000

# Check environment variables
echo $PRIVATE_KEY
```

### M-Pesa not working
- Verify credentials in .env
- Check callback URL is accessible
- Check firewall rules
- Test with Safaricom sandbox first

### Blockchain transactions failing
- Check wallet has enough MATIC
- Check RPC URL is correct
- Check contract addresses are correct
- Check gas prices

---

## 📚 Useful Links

- **Polygon Docs:** https://polygon.technology/developers
- **PolygonScan:** https://polygonscan.com
- **Safaricom Daraja:** https://developer.safaricom.co.ke/
- **Hardhat Docs:** https://hardhat.org/
- **Ethers.js Docs:** https://docs.ethers.org/

---

## ✅ Success Criteria

- [ ] All contracts deployed to mainnet
- [ ] All contracts verified on PolygonScan
- [ ] M-Pesa integration working with production credentials
- [ ] Database persisting all data
- [ ] Frontend connecting to mainnet
- [ ] Backend handling 100+ requests/second
- [ ] Error tracking working
- [ ] Monitoring alerts configured
- [ ] 99.9% uptime target

🎉 **You're ready to launch!**

