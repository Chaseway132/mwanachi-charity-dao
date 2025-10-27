# 🚀 Blockchain Deployment Guide - Polygon Mumbai Testnet

## 📋 Quick Overview

We're deploying 5 smart contracts to Polygon Mumbai testnet:
1. **ProposalManagement** - Proposal creation and voting
2. **FundAllocation** - Fund distribution
3. **DonationTracking** - Track all donations
4. **VotingGovernance** - DAO voting mechanism
5. **CharityDAOPlatform** - Main orchestrator

---

## ✅ Step 1: Get Test MATIC from Faucet

### What You Need:
- MetaMask wallet address (your public address)
- Mumbai testnet added to MetaMask

### How to Get Test MATIC:

1. **Open Polygon Faucet:**
   - Go to: https://faucet.polygon.technology/

2. **Select Mumbai Network:**
   - Click "Mumbai" in the network dropdown

3. **Enter Your Wallet Address:**
   - Copy your MetaMask address (starts with 0x)
   - Paste it in the faucet form

4. **Request Tokens:**
   - Click "Submit"
   - Wait 1-2 minutes
   - You'll receive 0.5 test MATIC

5. **Verify in MetaMask:**
   - Open MetaMask
   - Switch to Mumbai network
   - You should see ~0.5 MATIC balance

---

## 🔐 Step 2: Configure Environment Variables

### What You Need:
- Your private key (from MetaMask)
- PolygonScan API key (for contract verification)

### How to Get Private Key:

1. **Open MetaMask:**
   - Click your account icon (top right)
   - Click "Account details"
   - Click "Show private key"
   - Enter your password
   - Copy the private key

2. **Add to .env File:**
   ```
   PRIVATE_KEY=your_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
   ```

### How to Get PolygonScan API Key:

1. **Go to PolygonScan:**
   - Visit: https://polygonscan.com/

2. **Create Account:**
   - Click "Sign in" (top right)
   - Click "Create account"
   - Fill in details and verify email

3. **Get API Key:**
   - Go to: https://polygonscan.com/apis
   - Click "Create API Key"
   - Name it "Charity DAO"
   - Copy the API key

4. **Add to .env:**
   ```
   POLYGONSCAN_API_KEY=your_api_key_here
   ```

---

## 🚀 Step 3: Deploy Contracts

### Run Deployment Script:

```bash
npx hardhat run scripts/deploy-all-new.js --network mumbai
```

### Expected Output:
```
Deploying all contracts from scratch...
Deploying with account: 0x...

Deploying ProposalManagement contract...
ProposalManagement deployed to: 0x...

Deploying FundAllocation contract...
FundAllocation deployed to: 0x...

Deploying DonationTracking contract...
DonationTracking deployed to: 0x...

Deploying VotingGovernance contract...
VotingGovernance deployed to: 0x...

Deploying CharityDAOPlatform contract...
CharityDAOPlatform deployed to: 0x...

Deployment and configuration completed successfully!
```

### What Gets Created:
- ✅ `deployedAddresses.json` - Backend addresses
- ✅ `charity-dao-frontend/src/config/deployedAddresses.ts` - Frontend addresses

---

## ✅ Step 4: Verify Contracts on PolygonScan

### Verify Each Contract:

```bash
# ProposalManagement
npx hardhat verify --network mumbai <ADDRESS>

# FundAllocation
npx hardhat verify --network mumbai <ADDRESS>

# DonationTracking
npx hardhat verify --network mumbai <ADDRESS> <FUND_ALLOCATION_ADDRESS>

# VotingGovernance
npx hardhat verify --network mumbai <ADDRESS>

# CharityDAOPlatform
npx hardhat verify --network mumbai <ADDRESS> <PROPOSAL_ADDRESS> <DONATION_ADDRESS> <VOTING_ADDRESS> <FUND_ALLOCATION_ADDRESS>
```

---

## 🧪 Step 5: Test Contracts

### Test Donation:
1. Go to PolygonScan
2. Find CharityDAOPlatform contract
3. Click "Write Contract"
4. Connect MetaMask
5. Call `donate()` with 0.01 MATIC
6. Confirm transaction

### Check Results:
- ✅ Transaction appears on PolygonScan
- ✅ Donation recorded in DonationTracking
- ✅ Funds transferred to FundAllocation

---

## 📊 Troubleshooting

### Error: "Insufficient funds"
- Get more test MATIC from faucet
- Wait 1-2 minutes for tokens to arrive

### Error: "Invalid private key"
- Check .env file format
- Make sure no extra spaces or quotes

### Error: "Network error"
- Check internet connection
- Try different RPC URL

### Error: "Contract verification failed"
- Wait 30 seconds after deployment
- Make sure constructor args are correct
- Check PolygonScan API key

---

## ✅ Checklist

- [ ] Got test MATIC from faucet
- [ ] Added PRIVATE_KEY to .env
- [ ] Added POLYGONSCAN_API_KEY to .env
- [ ] Ran deployment script
- [ ] All 5 contracts deployed
- [ ] Verified contracts on PolygonScan
- [ ] Tested donation function
- [ ] Updated frontend with addresses

---

## 🎉 Next Steps

After successful deployment:
1. ✅ Test all contract functions
2. ✅ Update frontend configuration
3. ✅ Test M-Pesa integration with blockchain
4. ✅ Deploy to Polygon mainnet (when ready)

---

**Ready to deploy? Let's go! 🚀**

