# ✅ Polygon Amoy - Action Checklist

## 🎯 Your Mission: Get Polygon Amoy Working

Follow these steps in order. Check off each one as you complete it.

---

## 📋 Phase 1: MetaMask Setup (5 minutes)

### Step 1: Add Polygon Amoy Network
- [ ] Open MetaMask extension
- [ ] Click network dropdown (top of popup)
- [ ] Click "Add network" button
- [ ] Fill in these details:
  - [ ] Network Name: `Polygon Amoy`
  - [ ] RPC URL: `https://rpc-amoy.polygon.technology`
  - [ ] Chain ID: `80002`
  - [ ] Currency Symbol: `MATIC`
  - [ ] Block Explorer: `https://amoy.polygonscan.com`
- [ ] Click "Save"
- [ ] MetaMask switches to Polygon Amoy ✅

### Step 2: Verify Network Added
- [ ] MetaMask shows "Polygon Amoy" at top
- [ ] Balance shows 0 MATIC (that's normal)
- [ ] No error messages

---

## 💰 Phase 2: Get Test Tokens (5 minutes)

### Step 3: Get Test MATIC from Faucet
- [ ] Go to: https://faucet.polygon.technology/
- [ ] Select "Polygon Amoy" from dropdown
- [ ] Copy your address from MetaMask (click on address)
- [ ] Paste address into faucet
- [ ] Click "Submit"
- [ ] Wait 1-2 minutes
- [ ] Check MetaMask balance (should show MATIC now)

**If faucet doesn't work:**
- [ ] Try Alchemy: https://www.alchemy.com/faucets/polygon-amoy
- [ ] Try QuickNode: https://faucet.quicknode.com/polygon/amoy

---

## 🔧 Phase 3: Hardhat Configuration (5 minutes)

### Step 4: Update .env File
- [ ] Open `.env` file in project root
- [ ] Find your MetaMask private key:
  - [ ] Open MetaMask
  - [ ] Click Settings
  - [ ] Click Account Details
  - [ ] Click "Export Private Key"
  - [ ] Copy the key (starts with 0x)
- [ ] Add to .env:
  ```
  PRIVATE_KEY=your_private_key_here
  ```
- [ ] Save file
- [ ] ⚠️ NEVER commit this file with your real key!

### Step 5: Verify Hardhat Config
- [ ] Open `hardhat.config.js`
- [ ] Check it has `amoy` network:
  ```javascript
  amoy: {
    url: "https://rpc-amoy.polygon.technology",
    chainId: 80002,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  }
  ```
- [ ] If not there, add it (already done for you!)

---

## 🚀 Phase 4: Deploy Contracts (5 minutes)

### Step 6: Test Connection
- [ ] Open terminal in project root
- [ ] Run:
  ```bash
  npx hardhat network-info --network amoy
  ```
- [ ] Should show network details (not an error)

### Step 7: Check Balance
- [ ] Run:
  ```bash
  npx hardhat run scripts/check-balance.js --network amoy
  ```
- [ ] Should show your MATIC balance (not 0)

### Step 8: Deploy Contracts
- [ ] Run:
  ```bash
  npx hardhat run scripts/deploy.js --network amoy
  ```
- [ ] Wait for deployment to complete
- [ ] Should show contract addresses
- [ ] ✅ Contracts deployed to Polygon Amoy!

---

## ✅ Phase 5: Verification (5 minutes)

### Step 9: Verify on Block Explorer
- [ ] Go to: https://amoy.polygonscan.com
- [ ] Search for your address (from MetaMask)
- [ ] Should see your transactions
- [ ] Should see deployed contracts

### Step 10: Verify in MetaMask
- [ ] MetaMask shows "Polygon Amoy"
- [ ] Balance shows your MATIC
- [ ] No error messages
- [ ] Can see transaction history

---

## 🎉 Success Criteria

You're done when:
- ✅ MetaMask shows Polygon Amoy network
- ✅ You have test MATIC tokens
- ✅ Hardhat can connect to Amoy
- ✅ Contracts deployed successfully
- ✅ Block explorer shows your transactions

---

## 🆘 If Something Goes Wrong

1. **Check troubleshooting guide**: `🆘_POLYGON_AMOY_TROUBLESHOOTING.md`
2. **Check quick setup**: `⚡_AMOY_QUICK_SETUP.md`
3. **Check full guide**: `🔧_POLYGON_AMOY_SETUP_GUIDE.md`

---

## 📊 Progress Tracker

```
Phase 1: MetaMask Setup        [ ] 0% → [ ] 100%
Phase 2: Get Test Tokens       [ ] 0% → [ ] 100%
Phase 3: Hardhat Config        [ ] 0% → [ ] 100%
Phase 4: Deploy Contracts      [ ] 0% → [ ] 100%
Phase 5: Verification          [ ] 0% → [ ] 100%

TOTAL PROGRESS: ___/5 phases complete
```

---

## 🚀 Next Steps After This

Once Polygon Amoy is working:
1. Deploy M-Pesa integration
2. Test blockchain transactions
3. Set up production deployment
4. Launch on mainnet

---

**You've got this! Let's get Polygon Amoy working! 💪**


