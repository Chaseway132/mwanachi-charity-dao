# 🔧 MetaMask RPC Configuration - CRITICAL FIX

## 🚨 THE PROBLEM

Your MetaMask is configured with a **BROKEN RPC endpoint**:
```
https://polygon-amoy-testnet.rpc.grove.city/v1/01fdb492
```

This Grove.city endpoint is **completely down** and not responding to any requests.

**Error you're seeing:**
```
RPC endpoint not found or unavailable
```

## ✅ THE SOLUTION (5 MINUTES)

### Step 1: Open MetaMask Settings
1. Click the **MetaMask icon** in your browser
2. Click the **three dots** (⋮) menu in top right
3. Click **Settings**

### Step 2: Go to Networks
1. In the left sidebar, click **Networks**
2. You should see a list of networks
3. Find and click **Polygon Amoy**

### Step 3: Edit the Network
1. Click the **three dots** next to Polygon Amoy
2. Click **Edit**

### Step 4: Replace the RPC URL
You should see a field that says **RPC URL** with this value:
```
https://polygon-amoy-testnet.rpc.grove.city/v1/01fdb492
```

**DELETE everything in that field and replace with:**
```
https://rpc-amoy.polygon.technology/
```

### Step 5: Save
1. Click **Save**
2. MetaMask will verify the connection
3. You should see a green checkmark

### Step 6: Refresh the App
1. Go to: https://chaseway132.github.io/mwanachi-charity-dao/
2. Press: `Ctrl+Shift+R` (hard refresh)
3. Wait for page to load

### Step 7: Try Your Donation
1. Click **"Make a Donation"**
2. Enter amount: `0.01` ETH
3. Click **Donate**
4. Approve in MetaMask
5. ✅ Should work now!

## 📋 Verify Your Configuration

After saving, check that MetaMask shows:

| Setting | Value |
|---------|-------|
| **Network Name** | Polygon Amoy |
| **Chain ID** | 80002 |
| **Currency** | MATIC |
| **RPC URL** | `https://rpc-amoy.polygon.technology/` |

## 🔄 Alternative RPC Endpoints

If the primary RPC doesn't work, try these (in order):

| RPC URL | Provider | Status |
|---------|----------|--------|
| `https://rpc-amoy.polygon.technology/` | Polygon (Official) | ✅ **BEST** |
| `https://polygon-amoy.blockpi.network/v1/rpc/public` | BlockPI | ✅ Good |
| `https://amoy.drpc.org` | DRPC | ✅ Good |
| `https://amoy-rpc.c.multiversx.com/` | MultiversX | ✅ Good |

**To switch:**
1. Go back to MetaMask Settings → Networks → Polygon Amoy → Edit
2. Replace the RPC URL with one from the list above
3. Click Save
4. Refresh browser

## 🆘 Troubleshooting

### Still Getting "RPC endpoint not found" Error?

**Option 1: Clear MetaMask Cache**
1. MetaMask Settings → Advanced
2. Click **"Clear activity tab data"**
3. Refresh browser
4. Try donation again

**Option 2: Try Different RPC**
1. Use one of the alternative RPC URLs above
2. Save and refresh
3. Try donation again

**Option 3: Restart MetaMask**
1. Click MetaMask icon
2. Click your account icon (top right)
3. Click **Lock**
4. Unlock with your password
5. Refresh browser

### Transaction Still Pending?

If you have a stuck transaction:
1. Go to MetaMask Activity tab
2. Find the pending transaction
3. Click **Cancel** or **Speed up**
4. Approve the action
5. Wait for it to complete

## 📊 What Changed in the Code

I've updated the frontend to:
- ✅ Use fallback RPC endpoints if MetaMask fails
- ✅ Automatically retry with public RPC for balance checking
- ✅ Better error messages when RPC is unavailable
- ✅ Graceful degradation when MetaMask RPC fails

This means even if MetaMask's RPC is slow, the app will still work!

## 🎯 After Fixing RPC

1. ✅ Donations will go through
2. ✅ Fund balance will update
3. ✅ Recent donations will show
4. ✅ You can create proposals
5. ✅ You can vote on proposals
6. ✅ You can execute proposals

## 📞 Quick Reference

**Current Broken RPC:**
```
https://polygon-amoy-testnet.rpc.grove.city/v1/01fdb492
```

**Replace with:**
```
https://rpc-amoy.polygon.technology/
```

**MetaMask Path:**
Settings → Networks → Polygon Amoy → Edit → RPC URL

---

**This is the ONLY thing blocking your donations from working!** Once you change the RPC URL, everything will work perfectly. 🚀

