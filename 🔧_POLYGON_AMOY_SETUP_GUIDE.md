# 🔧 Polygon Amoy Setup Guide - Complete Fix

## 🎯 What's Happening

**Polygon Amoy** is the **NEW testnet** that replaced Mumbai. Your hardhat config now has it, but MetaMask doesn't know about it yet.

---

## ✅ Step 1: Add Polygon Amoy to MetaMask Manually

### Method A: Using MetaMask UI (Easiest)

1. **Open MetaMask** (click the fox icon)
2. **Click the network dropdown** at the top
3. **Click "Add network"** button
4. **Fill in these details:**

```
Network Name: Polygon Amoy
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer URL: https://amoy.polygonscan.com
```

5. **Click "Save"**
6. **MetaMask will switch to Polygon Amoy automatically**

---

## ✅ Step 2: Get Test MATIC Tokens

Now you need test tokens to deploy contracts.

### Option 1: Polygon Faucet (Official)
1. Go to: https://faucet.polygon.technology/
2. Select **"Polygon Amoy"** from dropdown
3. Paste your MetaMask address
4. Click **"Submit"**
5. Wait 1-2 minutes for tokens

### Option 2: Alchemy Faucet
1. Go to: https://www.alchemy.com/faucets/polygon-amoy
2. Paste your MetaMask address
3. Click **"Send Me MATIC"**
4. Wait for confirmation

### Option 3: QuickNode Faucet
1. Go to: https://faucet.quicknode.com/polygon/amoy
2. Paste your MetaMask address
3. Click **"Claim"**

---

## ✅ Step 3: Verify Setup

### Check MetaMask:
- ✅ Network shows "Polygon Amoy"
- ✅ Chain ID shows 80002
- ✅ You have MATIC tokens (check balance)

### Check Hardhat:
```bash
npx hardhat network-info --network amoy
```

---

## ✅ Step 4: Deploy to Polygon Amoy

Once you have test MATIC:

```bash
# Set your private key in .env
echo "PRIVATE_KEY=your_private_key_here" >> .env

# Deploy contracts
npx hardhat run scripts/deploy.js --network amoy
```

---

## 🔍 Troubleshooting

### Problem: "Network refused to be created"

**Solution:** This usually means:
1. ❌ RPC URL is wrong
2. ❌ Chain ID is wrong
3. ❌ MetaMask cache issue

**Fix:**
1. Delete the network from MetaMask
2. Clear MetaMask cache: Settings → Advanced → Clear activity tab data
3. Add it again with exact details above

### Problem: "Connecting to Ganache" still shows

**Solution:**
1. Cancel the connection
2. Make sure you're on **Polygon Amoy** network (not Ganache)
3. Then try connecting to ChainList again

### Problem: No test MATIC tokens

**Solution:**
1. Try all 3 faucets above
2. Wait 2-3 minutes between attempts
3. Check your address is correct (copy from MetaMask)

---

## 📋 Network Details Reference

| Property | Value |
|----------|-------|
| **Network Name** | Polygon Amoy |
| **RPC URL** | https://rpc-amoy.polygon.technology |
| **Chain ID** | 80002 |
| **Currency** | MATIC |
| **Block Explorer** | https://amoy.polygonscan.com |
| **Status** | Active Testnet |

---

## 🚀 Next Steps

1. ✅ Add Polygon Amoy to MetaMask
2. ✅ Get test MATIC tokens
3. ✅ Deploy contracts to Amoy
4. ✅ Test on blockchain

---

## 💡 Why Amoy Instead of Mumbai?

- ✅ **Mumbai is deprecated** - Polygon stopped supporting it
- ✅ **Amoy is the new standard** - All new projects use it
- ✅ **Better performance** - Faster blocks, more stable
- ✅ **Future-proof** - Will be supported long-term

---

## ✅ Verification Checklist

- [ ] Polygon Amoy added to MetaMask
- [ ] Chain ID is 80002
- [ ] RPC URL is https://rpc-amoy.polygon.technology
- [ ] Have test MATIC tokens
- [ ] MetaMask shows correct balance
- [ ] Hardhat config has amoy network
- [ ] Ready to deploy!


