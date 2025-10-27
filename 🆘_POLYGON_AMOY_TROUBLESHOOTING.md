# 🆘 Polygon Amoy Troubleshooting - Complete Guide

## ❌ Problem 1: "Network refused to be created"

### Symptoms:
- MetaMask shows error when adding network
- Network doesn't appear in list
- Can't switch to Polygon Amoy

### Root Causes & Fixes:

#### Cause 1: Wrong RPC URL
```
❌ Wrong: https://rpc-mumbai.maticvigil.com (this is Mumbai, not Amoy)
✅ Correct: https://rpc-amoy.polygon.technology
```

**Fix:**
1. Delete the network from MetaMask
2. Add again with: `https://rpc-amoy.polygon.technology`

#### Cause 2: Wrong Chain ID
```
❌ Wrong: 80001 (this is Mumbai)
✅ Correct: 80002 (this is Amoy)
```

**Fix:**
1. Delete the network
2. Add again with Chain ID: `80002`

#### Cause 3: MetaMask Cache Issue
**Fix:**
1. Open MetaMask
2. Click Settings → Advanced
3. Click "Clear activity tab data"
4. Restart browser
5. Try adding network again

#### Cause 4: Network is Down
**Check:** https://status.polygon.technology/
- If Amoy is down, wait 30 minutes and try again

---

## ❌ Problem 2: "Connecting to Ganache" Still Shows

### Symptoms:
- ChainList shows "Connecting to Ganache"
- Can't connect to ChainList
- MetaMask stuck on Ganache network

### Root Causes & Fixes:

#### Cause 1: Still on Ganache Network
**Fix:**
1. Click MetaMask extension
2. Click network dropdown at top
3. Select "Polygon Amoy"
4. Go back to ChainList
5. Click "Connect" again

#### Cause 2: ChainList Cache Issue
**Fix:**
1. Close ChainList tab
2. Clear browser cache (Ctrl+Shift+Delete)
3. Go to https://chainlist.org/ again
4. Try connecting

#### Cause 3: MetaMask Not Responding
**Fix:**
1. Close MetaMask
2. Restart browser
3. Open MetaMask again
4. Try connecting to ChainList

---

## ❌ Problem 3: No Test MATIC Tokens

### Symptoms:
- Faucet says "address already claimed"
- Faucet doesn't send tokens
- Balance shows 0 MATIC

### Root Causes & Fixes:

#### Cause 1: Already Claimed Today
**Fix:**
- Faucets have daily limits
- Wait 24 hours and try again
- Try different faucet (see below)

#### Cause 2: Wrong Address
**Fix:**
1. Copy address from MetaMask (click on address)
2. Paste into faucet
3. Make sure it starts with "0x"
4. Make sure it's your Amoy address (not Ethereum)

#### Cause 3: Faucet is Down
**Try these alternatives:**
1. **Polygon Faucet**: https://faucet.polygon.technology/
2. **Alchemy Faucet**: https://www.alchemy.com/faucets/polygon-amoy
3. **QuickNode Faucet**: https://faucet.quicknode.com/polygon/amoy

#### Cause 4: Transaction Pending
**Fix:**
1. Wait 5-10 minutes
2. Refresh MetaMask (pull down to refresh)
3. Check on block explorer: https://amoy.polygonscan.com
4. Search your address

---

## ❌ Problem 4: Hardhat Can't Connect to Amoy

### Symptoms:
- `npx hardhat run scripts/deploy.js --network amoy` fails
- Error: "Could not connect to network"
- Error: "Invalid chain ID"

### Root Causes & Fixes:

#### Cause 1: Missing PRIVATE_KEY in .env
**Fix:**
1. Open `.env` file
2. Add your private key:
   ```
   PRIVATE_KEY=your_private_key_here
   ```
3. Get private key from MetaMask:
   - Settings → Account Details → Export Private Key
4. Save file
5. Try deploy again

#### Cause 2: Wrong RPC URL in hardhat.config.js
**Fix:**
Check `hardhat.config.js` has:
```javascript
amoy: {
  url: "https://rpc-amoy.polygon.technology",
  chainId: 80002,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
}
```

#### Cause 3: No Test MATIC
**Fix:**
1. Get test MATIC from faucet (see Problem 3)
2. Check balance: `npx hardhat run scripts/check-balance.js --network amoy`
3. Try deploy again

---

## ❌ Problem 5: "Invalid Chain ID" Error

### Symptoms:
- Error when deploying
- MetaMask shows wrong chain ID
- Contract deployment fails

### Root Causes & Fixes:

#### Cause 1: Hardhat Config Wrong
**Fix:**
Check `hardhat.config.js`:
```javascript
amoy: {
  chainId: 80002,  // ✅ Must be 80002
  url: "https://rpc-amoy.polygon.technology",
}
```

#### Cause 2: MetaMask Chain ID Wrong
**Fix:**
1. Delete network from MetaMask
2. Add again with Chain ID: `80002`
3. Verify in MetaMask settings

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] MetaMask shows "Polygon Amoy"
- [ ] Chain ID is 80002
- [ ] RPC URL is https://rpc-amoy.polygon.technology
- [ ] You have test MATIC (check balance)
- [ ] .env has PRIVATE_KEY
- [ ] hardhat.config.js has amoy network
- [ ] No errors in console

---

## 🔗 Useful Links

| Resource | Link |
|----------|------|
| **Faucet** | https://faucet.polygon.technology/ |
| **Block Explorer** | https://amoy.polygonscan.com |
| **Status Page** | https://status.polygon.technology/ |
| **Docs** | https://polygon.technology/developers |
| **RPC Endpoint** | https://rpc-amoy.polygon.technology |

---

## 🆘 Still Stuck?

1. **Check block explorer**: https://amoy.polygonscan.com
2. **Check status**: https://status.polygon.technology/
3. **Check RPC**: https://rpc-amoy.polygon.technology (should return JSON)
4. **Try different faucet** for test tokens
5. **Clear MetaMask cache** and restart

---

**You've got this! 💪**


