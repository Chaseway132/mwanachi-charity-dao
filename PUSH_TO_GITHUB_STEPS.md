# 📤 Push to GitHub - Step by Step

## 🎯 Complete Instructions to Upload Your Project

---

## **Step 1: Create Repository on GitHub**

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name:** `mwanachi-charity-dao`
   - **Description:** "Blockchain-based charitable platform for Kenya with M-Pesa integration"
   - **Visibility:** Public
   - **Initialize repository:** Leave unchecked
3. Click **Create repository**

---

## **Step 2: Configure Git Locally**

Open PowerShell and run:

```powershell
# Set your Git username
git config --global user.name "Chaseway132"

# Set your Git email
git config --global user.email "your-email@example.com"

# Verify
git config --global --list
```

---

## **Step 3: Add Remote Repository**

```powershell
# Navigate to project directory
cd "c:\Users\HOME\OneDrive - Strathmore University\Desktop\Mwanachi Charity DAO"

# Add remote
git remote add origin https://github.com/Chaseway132/mwanachi-charity-dao.git

# Verify
git remote -v
```

Expected output:
```
origin  https://github.com/Chaseway132/mwanachi-charity-dao.git (fetch)
origin  https://github.com/Chaseway132/mwanachi-charity-dao.git (push)
```

---

## **Step 4: Check Git Status**

```powershell
git status
```

This shows:
- Files ready to commit
- Files not tracked
- Current branch

---

## **Step 5: Stage All Changes**

```powershell
# Stage all files
git add .

# Verify what will be committed
git status
```

---

## **Step 6: Create Initial Commit**

```powershell
git commit -m "Initial commit: Mwanachi Charity DAO - Full stack blockchain charity platform

- Smart contracts: ProposalManagement, DonationTracking, VotingGovernance, FundAllocation, CharityDAOPlatform
- Special Donations system with TransparencyLedger smart contract
- M-Pesa integration for Kenyan mobile payments
- React frontend with real-time updates and analytics
- Backend API with Express.js
- Hardhat configuration for Polygon deployment
- Complete documentation and deployment guides"
```

---

## **Step 7: Push to GitHub**

```powershell
# Set main branch and push
git branch -M main
git push -u origin main
```

**First time may ask for authentication:**
- Username: `Chaseway132`
- Password: Use Personal Access Token (see below)

---

## **Step 8: Generate Personal Access Token (if needed)**

If git asks for password:

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Set:
   - **Token name:** `mwanachi-charity-dao`
   - **Expiration:** 90 days
   - **Scopes:** Check `repo` (full control)
4. Click **Generate token**
5. Copy the token (you won't see it again!)
6. Use as password when git asks

---

## **Step 9: Verify on GitHub**

1. Go to: https://github.com/Chaseway132/mwanachi-charity-dao
2. You should see all your files!
3. Check the commit message

---

## **Step 10: Future Commits**

After making changes:

```powershell
# Stage changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push
```

---

## 📋 **What Gets Uploaded**

✅ **Uploaded:**
- All smart contracts (Solidity)
- Frontend code (React/TypeScript)
- Backend code (Node.js/Express)
- Hardhat configuration
- Deployment scripts
- Documentation files
- Package.json files
- README.md
- .env.example

❌ **NOT Uploaded (protected by .gitignore):**
- `node_modules/` (dependencies)
- `.env` (private keys, API keys)
- `artifacts/` (compiled contracts)
- `cache/` (build cache)
- `.vscode/` (IDE settings)

---

## 🔐 **Security Checklist**

✅ `.env` is in `.gitignore` - **PRIVATE KEYS ARE SAFE**
✅ `node_modules/` is in `.gitignore` - **Keeps repo small**
✅ No sensitive data in commits

---

## 🚀 **Complete Command Sequence**

Copy and paste this entire sequence:

```powershell
# Navigate to project
cd "c:\Users\HOME\OneDrive - Strathmore University\Desktop\Mwanachi Charity DAO"

# Configure git
git config --global user.name "Chaseway132"
git config --global user.email "your-email@example.com"

# Add remote
git remote add origin https://github.com/Chaseway132/mwanachi-charity-dao.git

# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "Initial commit: Mwanachi Charity DAO - Full stack blockchain charity platform"

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## ✅ **Done!**

Your project is now on GitHub! 🎉

**Next steps:**
1. Share the link with collaborators
2. Add collaborators if needed
3. Set up branch protection rules
4. Enable GitHub Actions for CI/CD

---

## 📞 **Troubleshooting**

### **"fatal: remote origin already exists"**
```powershell
git remote remove origin
git remote add origin https://github.com/Chaseway132/mwanachi-charity-dao.git
```

### **"Permission denied (publickey)"**
- Use HTTPS instead of SSH
- Or generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### **"Everything up-to-date"**
- No changes to commit
- Make changes and try again

### **"fatal: not a git repository"**
```powershell
git init
```

---

## 🎯 **You're Ready!**

Follow the steps above and your project will be on GitHub! 🚀

