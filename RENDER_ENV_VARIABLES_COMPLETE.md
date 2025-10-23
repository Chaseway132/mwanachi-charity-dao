# 🔐 COMPLETE ENVIRONMENT VARIABLES FOR RENDER

## ✅ Found in Codebase!

I found the exact JWT_SECRET configuration in `backend/.env.example`. Here's what you need:

---

## 📋 ALL Environment Variables Needed

### **MINIMUM (To Get Backend Running)**

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_PASSWORD=Charity@DAO2025!Secure
```

### **RECOMMENDED (For Full Features)**

```
# Admin Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_PASSWORD=Charity@DAO2025!Secure
ADMIN_WALLETS=0x06A8ee55E0846F5b8A5CdEeA925FCfecB6504ac3

# Backend Configuration
PORT=5000
NODE_ENV=production
BACKEND_URL=https://your-backend-url.onrender.com

# M-Pesa Configuration (for testing later)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=your_shortcode_here
MPESA_PASSKEY=your_passkey_here

# Blockchain Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com

# Smart Contract Addresses
CHARITY_DAO_PLATFORM_ADDRESS=0x06A8ee55E0846F5b8A5CdEeA925FCfecB6504ac3
DONATION_TRACKING_ADDRESS=0x16A46C22B82095C7431a03d938D8F0752bD9AB15
VOTING_GOVERNANCE_ADDRESS=0x159089178f162719dEbe52124233826A226628C0
FUND_ALLOCATION_ADDRESS=0xC5d8cAe824ead64edE0Ff14D8db69Dd782b261B4
PROPOSAL_MANAGEMENT_ADDRESS=0xDE80a07b502a20F97bCD2dF2be3Ed6229a4bdE16
```

---

## 🔑 How to Generate JWT_SECRET

### **Method 1: PowerShell (Easiest)**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output example:
```
a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
```

### **Method 2: Online Generator**
Go to: https://www.random.org/strings/
- Length: 64
- Characters: 0-9, a-f (hex)
- Generate

---

## 📝 Step-by-Step Setup in Render

### Step 1: Generate JWT_SECRET
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output.

### Step 2: Go to Render Dashboard
1. https://dashboard.render.com
2. Select your service: `mwanachi-charity-dao-backend`
3. Click "Environment" tab

### Step 3: Add Variables (MINIMUM)

**Variable 1:**
- Key: `JWT_SECRET`
- Value: `a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8`
- Click "Save"

**Variable 2:**
- Key: `ADMIN_PASSWORD`
- Value: `Charity@DAO2025!Secure`
- Click "Save"

**Variable 3:**
- Key: `PORT`
- Value: `5000`
- Click "Save"

**Variable 4:**
- Key: `NODE_ENV`
- Value: `production`
- Click "Save"

### Step 4: Redeploy
1. Go to "Deploys" tab
2. Click "Redeploy latest commit"
3. Wait 2-3 minutes

---

## ✅ Verify Backend is Working

Once deployed, test these URLs:

### Test 1: Health Check
```
https://your-backend-url/health
```

Should return:
```json
{
  "status": "Backend is running",
  "timestamp": "2025-10-23T..."
}
```

### Test 2: Test Route
```
https://your-backend-url/api/test
```

Should return:
```json
{
  "message": "Test route works!"
}
```

---

## 🎯 What Each Variable Does

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `JWT_SECRET` | Sign authentication tokens | ✅ YES |
| `ADMIN_PASSWORD` | Admin login password | ✅ YES |
| `PORT` | Backend port | ✅ YES |
| `NODE_ENV` | Environment (production/development) | ✅ YES |
| `ADMIN_WALLETS` | Wallet addresses for admin | ⚠️ Optional |
| `MPESA_*` | M-Pesa sandbox credentials | ⚠️ For testing later |
| `POLYGON_*` | Blockchain RPC URLs | ⚠️ For blockchain features |
| `*_ADDRESS` | Smart contract addresses | ⚠️ For blockchain features |

---

## 🔒 Security Notes

- ✅ Use strong, random JWT_SECRET
- ✅ Use strong ADMIN_PASSWORD
- ✅ Never share these values
- ✅ Never commit .env files to GitHub
- ✅ Use different values for production

---

## 📋 Quick Copy-Paste (Minimum)

Generate JWT_SECRET first:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then add to Render:
```
JWT_SECRET=<your-generated-value>
ADMIN_PASSWORD=Charity@DAO2025!Secure
PORT=5000
NODE_ENV=production
```

---

## 🚀 Next Steps

1. Generate JWT_SECRET
2. Add variables to Render
3. Redeploy
4. Test health endpoint
5. Update frontend with backend URL
6. Test admin login

---

**Ready? Generate your JWT_SECRET and add these variables to Render! 🚀**

