# 🔧 RPC Endpoint Circuit Breaker Error - FIX

## Problem
You're getting this error:
```
❌ Execution prevented because the circuit breaker is open
```

This means the RPC endpoint (Grove.city) is temporarily unavailable or overloaded.

## Solution: Switch to Official Polygon Amoy RPC

### Step 1: Open MetaMask Settings
1. Click the MetaMask extension icon
2. Click the **three dots** (⋮) menu
3. Select **Settings**

### Step 2: Add/Update Polygon Amoy Network
1. Go to **Networks** in the left sidebar
2. Find **Polygon Amoy** in the list
3. Click on it to edit

### Step 3: Update RPC URL
Replace the current RPC URL with one of these (in order of preference):

**Primary (Official Polygon):**
```
https://rpc-amoy.polygon.technology/
```

**Backup Options:**
```
https://amoy-rpc.c.multiversx.com/
https://polygon-amoy.blockpi.network/v1/rpc/public
https://amoy.drpc.org
```

### Step 4: Save and Test
1. Click **Save**
2. Make sure you're connected to **Polygon Amoy** network
3. Try making a donation again

## Why This Happens
- Grove.city RPC has rate limiting and circuit breaker protection
- When too many requests hit it, it temporarily blocks new requests
- Official Polygon RPC is more stable and reliable

## If Still Having Issues
1. **Try a different backup RPC** from the list above
2. **Wait a few minutes** - the circuit breaker may reset
3. **Check network status**: https://status.polygon.technology/
4. **Switch to Polygon Mumbai** temporarily (if you have test MATIC there)

## Recommended RPC Endpoints for Polygon Amoy

| Provider | URL | Status |
|----------|-----|--------|
| **Polygon (Official)** | `https://rpc-amoy.polygon.technology/` | ✅ Recommended |
| **BlockPI** | `https://polygon-amoy.blockpi.network/v1/rpc/public` | ✅ Good |
| **DRPC** | `https://amoy.drpc.org` | ✅ Good |
| **MultiversX** | `https://amoy-rpc.c.multiversx.com/` | ✅ Good |

## Verify Your Network Configuration

In MetaMask, you should see:
- **Network Name**: Polygon Amoy
- **Chain ID**: 80002
- **Currency**: MATIC
- **RPC URL**: One of the above

## After Switching RPC
1. Hard refresh your browser: `Ctrl+Shift+R`
2. Try making a donation
3. The transaction should go through!

---

**Note**: The smart contracts are working perfectly. This is just an RPC connectivity issue.

