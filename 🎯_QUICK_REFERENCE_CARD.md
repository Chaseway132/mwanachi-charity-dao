# 🎯 Polygon Amoy - Quick Reference Card

## 📋 Network Details (Copy-Paste Ready)

```
Network Name:     Polygon Amoy
RPC URL:          https://rpc-amoy.polygon.technology
Chain ID:         80002
Currency Symbol:  MATIC
Block Explorer:   https://amoy.polygonscan.com
```

---

## 🔗 Important Links

```
Faucet:           https://faucet.polygon.technology/
Block Explorer:   https://amoy.polygonscan.com
Status Page:      https://status.polygon.technology/
Documentation:    https://polygon.technology/developers
```

---

## 🚀 4-Step Setup

### Step 1: MetaMask
```
1. Open MetaMask
2. Click network dropdown
3. Click "Add network"
4. Fill in details above
5. Click Save
```

### Step 2: Get MATIC
```
1. Go to faucet.polygon.technology
2. Select "Polygon Amoy"
3. Paste your address
4. Click Submit
5. Wait 1-2 minutes
```

### Step 3: .env
```
PRIVATE_KEY=your_private_key_here
```

### Step 4: Deploy
```bash
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🔧 Hardhat Commands

```bash
# Check network
npx hardhat network-info --network amoy

# Check balance
npx hardhat run scripts/check-balance.js --network amoy

# Deploy
npx hardhat run scripts/deploy.js --network amoy

# Verify contract
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

---

## 📊 Comparison: Mumbai vs Amoy

| Feature | Mumbai | Amoy |
|---------|--------|------|
| Status | ❌ Deprecated | ✅ Active |
| Chain ID | 80001 | 80002 |
| Performance | Slow | Fast |
| Support | Ending | Long-term |
| Use | ❌ Don't use | ✅ Use this |

---

## ✅ Verification Checklist

```
[ ] MetaMask shows "Polygon Amoy"
[ ] Chain ID is 80002
[ ] Have test MATIC
[ ] .env has PRIVATE_KEY
[ ] hardhat.config.js has amoy
[ ] No error messages
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Network won't add | Check RPC URL & Chain ID |
| No test MATIC | Try different faucet |
| Deployment fails | Check PRIVATE_KEY in .env |
| Still shows Ganache | Switch network in MetaMask |

---

## 📚 Documentation

| Need | Read |
|------|------|
| Start here | 🎬_START_HERE_POLYGON_AMOY.md |
| Visual guide | 📸_METAMASK_AMOY_VISUAL_GUIDE.md |
| Quick ref | ⚡_AMOY_QUICK_SETUP.md |
| Full guide | 🔧_POLYGON_AMOY_SETUP_GUIDE.md |
| Checklist | ✅_POLYGON_AMOY_ACTION_CHECKLIST.md |
| Troubleshoot | 🆘_POLYGON_AMOY_TROUBLESHOOTING.md |

---

## 💰 Faucet Options

1. **Polygon Faucet** (Official)
   - https://faucet.polygon.technology/
   - Select: Polygon Amoy
   - Limit: 1 per day

2. **Alchemy Faucet**
   - https://www.alchemy.com/faucets/polygon-amoy
   - Limit: 1 per day

3. **QuickNode Faucet**
   - https://faucet.quicknode.com/polygon/amoy
   - Limit: 1 per day

---

## 🔐 Private Key Safety

```
✅ DO:
- Keep in .env (not committed)
- Use for testnet only
- Rotate regularly

❌ DON'T:
- Share with anyone
- Commit to git
- Use for mainnet funds
- Post online
```

---

## 📈 Gas Prices

```
Amoy Testnet:  ~1 Gwei (very cheap)
Polygon Main:  ~50 Gwei (cheap)
Ethereum:      ~20-100 Gwei (expensive)
```

---

## 🎯 Deployment Flow

```
1. Add to MetaMask
   ↓
2. Get test MATIC
   ↓
3. Add PRIVATE_KEY
   ↓
4. Run deploy command
   ↓
5. ✅ Contracts deployed!
   ↓
6. Check on block explorer
```

---

## 📱 MetaMask Settings

```
Settings → Advanced → Clear activity tab data
(Use if network won't add)
```

---

## 🚀 Ready?

1. Read: `🎬_START_HERE_POLYGON_AMOY.md`
2. Follow: The 4 steps above
3. Deploy: Your contracts
4. Test: Everything works
5. Launch: Go live! 🎉

---

**Print this card or bookmark it! 📌**


