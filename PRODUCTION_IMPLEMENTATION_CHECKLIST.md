# ✅ Production Implementation Checklist

## Phase 1: M-Pesa Production Setup (Week 1)

### Get Credentials
- [ ] Register on Safaricom Daraja (https://developer.safaricom.co.ke/)
- [ ] Create production app
- [ ] Get Consumer Key
- [ ] Get Consumer Secret
- [ ] Get Business Shortcode
- [ ] Get Passkey
- [ ] Configure callback URL in Daraja

### Update Backend
- [ ] Create `.env.production` file
- [ ] Add MPESA_ENVIRONMENT=production
- [ ] Add MPESA_CONSUMER_KEY
- [ ] Add MPESA_CONSUMER_SECRET
- [ ] Add MPESA_BUSINESS_SHORTCODE
- [ ] Add MPESA_PASSKEY
- [ ] Add BACKEND_URL (will get after hosting setup)
- [ ] Verify mpesa.js switches to production endpoints

### Test M-Pesa
- [ ] Test STK Push with real phone
- [ ] Verify callback is received
- [ ] Check donation is recorded
- [ ] Verify amount is correct

## Phase 2: Smart Contract Updates (Week 1)

### Update DonationTracking Contract
- [ ] Add MPesaDonation struct
- [ ] Add recordedReceipts mapping
- [ ] Add MPesaDonationReceived event
- [ ] Add recordMPesaDonation function
- [ ] Add duplicate receipt prevention

### Update Backend Blockchain Integration
- [ ] Install ethers.js (already done)
- [ ] Create contract ABI file
- [ ] Update recordDonationOnBlockchain function
- [ ] Add retry logic for failed transactions
- [ ] Add gas estimation
- [ ] Add error handling

### Deploy Updated Contracts
- [ ] Compile contracts: `npx hardhat compile`
- [ ] Deploy to Mumbai testnet first
- [ ] Verify on PolygonScan
- [ ] Test recordMPesaDonation function
- [ ] Deploy to Polygon mainnet
- [ ] Verify on PolygonScan
- [ ] Add contract address to .env

## Phase 3: Frontend Setup (Week 1)

### GitHub Pages Configuration
- [ ] Add `homepage` to package.json
- [ ] Create `404.html` in public folder
- [ ] Update React Router with basename
- [ ] Update environment variables
- [ ] Build project: `npm run build`

### GitHub Actions Setup
- [ ] Create `.github/workflows/deploy.yml`
- [ ] Configure build and deploy steps
- [ ] Test deployment
- [ ] Verify site loads at GitHub Pages URL

### Frontend Updates
- [ ] Update backend URL to production
- [ ] Update contract addresses
- [ ] Update RPC URL to mainnet
- [ ] Test all forms
- [ ] Test wallet connection
- [ ] Test M-Pesa payment form

## Phase 4: Backend Hosting (Week 1-2)

### Choose Hosting Service
- [ ] Decide between Railway, Render, or Fly.io
- [ ] Create account
- [ ] Connect GitHub repository

### Deploy Backend
- [ ] Create Procfile
- [ ] Update package.json with start script
- [ ] Set environment variables
- [ ] Deploy
- [ ] Get backend URL
- [ ] Test health endpoint

### Configure Backend
- [ ] Update BACKEND_URL in environment
- [ ] Update CORS settings
- [ ] Test M-Pesa callback URL
- [ ] Verify all routes work
- [ ] Check logs for errors

## Phase 5: Integration Testing (Week 2)

### End-to-End Testing
- [ ] User enters phone number
- [ ] STK prompt appears
- [ ] User enters PIN
- [ ] Payment succeeds
- [ ] Donation recorded in backend
- [ ] Donation recorded on blockchain
- [ ] Frontend shows confirmation
- [ ] PolygonScan shows transaction

### Error Handling
- [ ] Test with invalid phone number
- [ ] Test with insufficient funds
- [ ] Test with network error
- [ ] Test with duplicate receipt
- [ ] Test with blockchain failure
- [ ] Verify error messages are clear

### Performance Testing
- [ ] Test with multiple concurrent donations
- [ ] Check response times
- [ ] Monitor server resources
- [ ] Check blockchain gas usage
- [ ] Verify no data loss

## Phase 6: Security & Monitoring (Week 2)

### Security
- [ ] Verify private key is not in code
- [ ] Verify credentials are in environment only
- [ ] Enable HTTPS (automatic on Railway/Render)
- [ ] Set up rate limiting
- [ ] Add input validation
- [ ] Test for SQL injection (if using DB)

### Monitoring
- [ ] Set up error logging
- [ ] Monitor M-Pesa callbacks
- [ ] Monitor blockchain transactions
- [ ] Set up alerts for failures
- [ ] Check logs regularly
- [ ] Monitor server uptime

### Backup & Recovery
- [ ] Document deployment process
- [ ] Create rollback plan
- [ ] Test recovery procedure
- [ ] Document all credentials (securely)
- [ ] Set up automated backups

## Phase 7: Launch Preparation (Week 2-3)

### Documentation
- [ ] Document API endpoints
- [ ] Document environment variables
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Create user guide

### Testing Checklist
- [ ] All features tested
- [ ] All error cases handled
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring working

### Pre-Launch
- [ ] Verify all services running
- [ ] Check database connectivity
- [ ] Verify M-Pesa integration
- [ ] Check blockchain connection
- [ ] Monitor logs for errors
- [ ] Test with real transaction

## Phase 8: Launch (Week 3)

### Launch Day
- [ ] Verify all services running
- [ ] Check health endpoints
- [ ] Monitor error rates
- [ ] Monitor transaction success rates
- [ ] Be ready to rollback if needed

### Post-Launch (First 24 Hours)
- [ ] Monitor error logs
- [ ] Check transaction success rate
- [ ] Monitor server performance
- [ ] Respond to user issues
- [ ] Verify blockchain transactions

### Post-Launch (First Week)
- [ ] Monitor uptime
- [ ] Check for any issues
- [ ] Optimize based on usage
- [ ] Gather user feedback
- [ ] Plan improvements

## Quick Reference: What Goes Where

### Environment Variables (.env.production)
```
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_BUSINESS_SHORTCODE=xxx
MPESA_PASSKEY=xxx
BACKEND_URL=https://your-backend.com
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=xxx
DONATION_TRACKING_CONTRACT=0x...
NODE_ENV=production
```

### Files to Update
- `backend/.env.production` - Backend config
- `backend/routes/mpesa.js` - Already supports production
- `backend/utils/donationHandler.js` - Add blockchain recording
- `contracts/DonationTracking.sol` - Add M-Pesa function
- `charity-dao-frontend/package.json` - Add homepage
- `charity-dao-frontend/public/404.html` - Create for SPA routing
- `charity-dao-frontend/src/App.tsx` - Update Router basename

### Services to Set Up
- Safaricom Daraja (M-Pesa)
- Railway/Render/Fly.io (Backend)
- GitHub Pages (Frontend)
- Polygon Network (Blockchain)

## Success Criteria

- [ ] M-Pesa production credentials working
- [ ] Real donations processed successfully
- [ ] Donations recorded on blockchain
- [ ] Frontend accessible via GitHub Pages
- [ ] Backend accessible via hosting service
- [ ] All routes working
- [ ] Error handling working
- [ ] Monitoring set up
- [ ] 99.9% uptime target
- [ ] < 200ms response time

## Timeline

- **Week 1:** M-Pesa setup + Smart contracts + Frontend + Backend hosting
- **Week 2:** Integration testing + Security + Monitoring
- **Week 3:** Launch preparation + Launch

## Support

If you get stuck:
1. Check the specific guide (MPESA_PRODUCTION_SETUP.md, etc.)
2. Check logs for error messages
3. Verify environment variables are set
4. Test each component independently
5. Check PolygonScan for blockchain issues

---

**You're ready to launch! Follow this checklist step by step.** 🚀

