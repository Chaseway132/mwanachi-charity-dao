# 🔐 OAuth 400 Error - M-Pesa Credentials Issue

## 🎯 **The Problem**

You're getting an **HTTP 400 error** from Safaricom's OAuth endpoint:

```
status: 400
url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
```

This means **Safaricom is rejecting your credentials**.

---

## 🔍 **Root Causes**

### Possible Issues:
1. ❌ **Credentials not set in Render environment**
2. ❌ **Credentials are incorrect/expired**
3. ❌ **Credentials have extra spaces or special characters**
4. ❌ **Wrong environment (sandbox vs production)**
5. ❌ **Safaricom API is down**

---

## 🔧 **How to Fix**

### Step 1: Verify Credentials in Render

1. Go to: https://dashboard.render.com
2. Click your backend service
3. Go to **Environment** tab
4. Check these variables:

```
MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
MPESA_CONSUMER_SECRET=wCehryGcCLI2tPqR0N5KHT8zBPoEt8zABEtl3T62wVJ1ABKXdnlZak9nSpC8iPjq
MPESA_ENVIRONMENT=sandbox
```

### Step 2: Check for Extra Spaces

**Common mistake:** Extra spaces at the beginning or end!

```
❌ WRONG: " 2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz "
✅ RIGHT: "2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz"
```

### Step 3: Verify Credentials are Correct

1. Open your local `.env` file
2. Copy the exact values:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
3. Paste into Render environment (no extra spaces!)
4. Redeploy

### Step 4: Check Render Logs

1. Go to Render dashboard
2. Click Logs tab
3. Look for:
   ```
   🔐 M-Pesa Config: { ... }
   🔑 Credential string length: [number]
   🔑 First 20 chars of key: [first 20 chars]
   🔐 Base64 auth header length: [number]
   📤 Sending OAuth request...
   ```

### Step 5: Test Again

1. Go to frontend
2. Test M-Pesa payment
3. Check logs for new output

---

## 📋 **Credentials Checklist**

### In Your Local `.env`:
- [ ] `MPESA_CONSUMER_KEY` is set
- [ ] `MPESA_CONSUMER_SECRET` is set
- [ ] No extra spaces
- [ ] No quotes around values
- [ ] Correct length (both should be ~60+ characters)

### In Render Environment:
- [ ] `MPESA_CONSUMER_KEY` matches local `.env`
- [ ] `MPESA_CONSUMER_SECRET` matches local `.env`
- [ ] No extra spaces
- [ ] `MPESA_ENVIRONMENT=sandbox`
- [ ] Redeploy after changes

---

## 🔍 **What the New Logs Will Show**

### If Credentials are Correct:
```
🔐 M-Pesa Config: {
  environment: 'sandbox',
  hasConsumerKey: true,
  hasConsumerSecret: true,
  businessShortcode: '174379',
  consumerKeyLength: 64,
  consumerSecretLength: 88
}
🔑 Credential string length: 153
🔑 First 20 chars of key: 2DJeVUnEaE1Gu9p8tXp
🔐 Base64 auth header length: 204
📤 Sending OAuth request...
✅ Access token obtained successfully
```

### If Credentials are Missing:
```
❌ Missing credentials:
   MPESA_CONSUMER_KEY: NOT SET
   MPESA_CONSUMER_SECRET: NOT SET
```

### If Credentials are Wrong:
```
📤 Sending OAuth request...
❌ Error getting M-Pesa access token: Request failed with status code 400
❌ Status code: 400
❌ Response data: { error: 'invalid_client' }
```

---

## 🎯 **Common Mistakes**

### Mistake 1: Extra Spaces
```
❌ " 2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz "
✅ "2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz"
```

### Mistake 2: Quotes in Value
```
❌ MPESA_CONSUMER_KEY="2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz"
✅ MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz
```

### Mistake 3: Wrong Environment
```
❌ MPESA_ENVIRONMENT=production (without credentials)
✅ MPESA_ENVIRONMENT=sandbox
```

### Mistake 4: Incomplete Copy-Paste
```
❌ MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBx (incomplete)
✅ MPESA_CONSUMER_KEY=2DJeVUnEaE1Gu9p8tXp7MtmBxtmmFdete2YHgEI72eIGoGjz (complete)
```

---

## 🚀 **Step-by-Step Fix**

### 1. Check Local `.env`
```bash
cat backend/.env | grep MPESA_CONSUMER
```

### 2. Copy Exact Values
- Copy `MPESA_CONSUMER_KEY` (no spaces!)
- Copy `MPESA_CONSUMER_SECRET` (no spaces!)

### 3. Update Render
1. Go to Render dashboard
2. Click backend service
3. Go to Environment
4. Find `MPESA_CONSUMER_KEY`
5. Delete current value
6. Paste new value (no spaces!)
7. Click Save
8. Repeat for `MPESA_CONSUMER_SECRET`

### 4. Redeploy
1. Click "Deploy" or "Redeploy"
2. Wait for "Deploy successful"

### 5. Test
1. Go to frontend
2. Test M-Pesa
3. Check logs

---

## 📊 **Verification**

### After Fix, You Should See:
```
✅ Access token obtained successfully
✅ STK Push sent successfully
✅ STK prompt appears on phone
```

### If Still Broken:
```
❌ Error getting M-Pesa access token
❌ Status code: 400
❌ Response data: { error: 'invalid_client' }
```

---

## 💡 **Pro Tips**

- ✅ Copy credentials carefully (no extra spaces!)
- ✅ Verify in Render environment
- ✅ Redeploy after changes
- ✅ Check logs immediately
- ✅ Look for credential length in logs

---

## 🎯 **Next Steps**

1. ✅ Check local `.env` for credentials
2. ✅ Go to Render environment
3. ✅ Update credentials (no spaces!)
4. ✅ Redeploy
5. ✅ Test M-Pesa
6. ✅ Check logs for new output
7. ✅ Share logs if still broken

---

**Fix the credentials in Render and redeploy! 🚀**

The new logging will help us see exactly what's happening! 📊

