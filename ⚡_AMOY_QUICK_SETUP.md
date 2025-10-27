# ⚡ Polygon Amoy - Quick Setup (2 Minutes)

## 🎯 TL;DR - Just Do This:

### Step 1: Add to MetaMask (1 minute)
```
Network Name: Polygon Amoy
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency: MATIC
Explorer: https://amoy.polygonscan.com
```

### Step 2: Get Test Tokens (1 minute)
Go to: https://faucet.polygon.technology/
- Select: Polygon Amoy
- Paste: Your MetaMask address
- Click: Submit
- Wait: 1-2 minutes

### Step 3: Done! ✅
- MetaMask shows Polygon Amoy
- You have test MATIC
- Ready to deploy

---

## 🔗 Quick Links

| What | Link |
|------|------|
| **Faucet** | https://faucet.polygon.technology/ |
| **Block Explorer** | https://amoy.polygonscan.com |
| **RPC Endpoint** | https://rpc-amoy.polygon.technology |
| **Docs** | https://polygon.technology/developers |

---

## 🚀 Deploy Command

```bash
npx hardhat run scripts/deploy.js --network amoy
```

---

## ✅ Verify It Works

```bash
# Check network
npx hardhat network-info --network amoy

# Check balance
npx hardhat run scripts/check-balance.js --network amoy
```

---

## 🆘 If It Still Fails

1. **Delete network** from MetaMask
2. **Clear cache**: Settings → Advanced → Clear activity tab data
3. **Add again** with exact details above
4. **Try faucet** again

---

**That's it! You're ready to deploy! 🚀**


