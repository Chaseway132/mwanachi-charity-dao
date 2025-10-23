# 🔐 ENVIRONMENT VARIABLES SETUP GUIDE

## 📋 What You Need to Set

For Render deployment, you need these environment variables:

```
ADMIN_PASSWORD
JWT_SECRET
FIREBASE_PROJECT_ID (optional for now)
FIREBASE_PRIVATE_KEY (optional for now)
FIREBASE_CLIENT_EMAIL (optional for now)
```

---

## 🔑 How to Generate Each One

### 1. **ADMIN_PASSWORD**
This is the password for admin login.

**Generate it:**
- Use any strong password you want
- Example: `MySecureAdminPass123!@#`
- Or generate a random one: https://www.random.org/passwords/

**Requirements:**
- At least 8 characters
- Mix of uppercase, lowercase, numbers, symbols

**Example:**
```
ADMIN_PASSWORD=Charity@DAO2025!Secure
```

---

### 2. **JWT_SECRET** ⭐ (Most Important)
This is a random string used to sign authentication tokens.

**Generate it (Choose ONE method):**

#### Method A: Using Node.js (Easiest)
Open PowerShell and run:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
```

#### Method B: Using Online Generator
Go to: https://www.random.org/strings/
- Length: 64
- Characters: 0-9, a-f (hex)
- Generate

#### Method C: Using OpenSSL
```powershell
openssl rand -hex 32
```

**Example:**
```
JWT_SECRET=a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
```

---

### 3. **FIREBASE_PROJECT_ID** (Optional for Now)
Only needed if you're using Firebase for database.

**For now, you can skip this** - the backend works without it.

If you want to set it:
- Go to Firebase Console: https://console.firebase.google.com
- Create a project or select existing one
- Get the Project ID from settings

**Example:**
```
FIREBASE_PROJECT_ID=mwanachi-charity-dao
```

---

### 4. **FIREBASE_PRIVATE_KEY** (Optional for Now)
Only needed if using Firebase.

**For now, you can skip this.**

If you need it later:
- Go to Firebase Console
- Service Accounts → Generate new private key
- Copy the `private_key` field

---

### 5. **FIREBASE_CLIENT_EMAIL** (Optional for Now)
Only needed if using Firebase.

**For now, you can skip this.**

---

## 🚀 QUICK SETUP (Minimum Required)

You only NEED these two:

```
ADMIN_PASSWORD=Charity@DAO2025!Secure
JWT_SECRET=a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
```

---

## 📝 Step-by-Step: Setting in Render

### Step 1: Generate Your Values

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

**Choose ADMIN_PASSWORD:**
```
Charity@DAO2025!Secure
```

### Step 2: Go to Render Dashboard

1. Go to https://dashboard.render.com
2. Select your service: `mwanachi-charity-dao-backend`
3. Click "Environment" tab
4. Click "Add Environment Variable"

### Step 3: Add Variables

**Add Variable 1:**
- Key: `ADMIN_PASSWORD`
- Value: `Charity@DAO2025!Secure`
- Click "Save"

**Add Variable 2:**
- Key: `JWT_SECRET`
- Value: `a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8`
- Click "Save"

### Step 4: Redeploy

1. Go to "Deploys" tab
2. Click "Redeploy latest commit"
3. Wait for deployment to complete

---

## ✅ Verification

Once deployed, test:

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

---

## 🔒 Security Notes

### DO:
- ✅ Use strong, random JWT_SECRET
- ✅ Use strong ADMIN_PASSWORD
- ✅ Never share these values
- ✅ Use different values for production

### DON'T:
- ❌ Use simple passwords like "admin123"
- ❌ Share JWT_SECRET in code or GitHub
- ❌ Use same values for multiple environments
- ❌ Commit .env files to GitHub

---

## 📋 Your Environment Variables

**Copy and paste these into Render:**

```
ADMIN_PASSWORD=Charity@DAO2025!Secure
JWT_SECRET=a7f3e9c2b1d4f6a8e5c9b2d7f1a4e8c3b6d9f2e5a8c1b4d7f0a3e6c9b2d5f8
```

(Replace with your own generated values!)

---

## 🎯 Next Steps

1. Generate your JWT_SECRET using Node.js command
2. Choose your ADMIN_PASSWORD
3. Add both to Render environment variables
4. Redeploy
5. Test the backend
6. Update frontend with backend URL
7. Test admin login

---

**Ready to set these up? Let me know if you need help! 🚀**

