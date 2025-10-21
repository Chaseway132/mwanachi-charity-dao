# 📤 GitHub Setup Guide - Mwanachi Charity DAO

## 🎯 Quick Start

Follow these steps to push your project to GitHub:

---

## **Step 1: Create a New Repository on GitHub**

1. Go to: https://github.com/new
2. Fill in the details:
   - **Repository name:** `mwanachi-charity-dao`
   - **Description:** "Blockchain-based charitable platform for Kenya with M-Pesa integration and transparent fund allocation"
   - **Visibility:** Public (so others can see and contribute)
   - **Initialize repository:** Leave unchecked (we already have git)
3. Click **Create repository**

---

## **Step 2: Configure Git Locally**

Open PowerShell and run:

```powershell
# Set your Git username (use your GitHub username)
git config --global user.name "Chaseway132"

# Set your Git email (use your GitHub email)
git config --global user.email "your-email@example.com"

# Verify configuration
git config --global --list
```

---

## **Step 3: Add Remote Repository**

```powershell
# Add the remote repository (replace with your repo URL)
git remote add origin https://github.com/Chaseway132/mwanachi-charity-dao.git

# Verify the remote was added
git remote -v
```

**Expected output:**
```
origin  https://github.com/Chaseway132/mwanachi-charity-dao.git (fetch)
origin  https://github.com/Chaseway132/mwanachi-charity-dao.git (push)
```

---

## **Step 4: Check Git Status**

```powershell
git status
```

This will show:
- Files ready to commit
- Files not tracked
- Current branch

---

## **Step 5: Stage All Changes**

```powershell
# Stage all changes
git add .

# Verify what will be committed
git status
```

---

## **Step 6: Create Initial Commit**

```powershell
git commit -m "Initial commit: Mwanachi Charity DAO - Full stack blockchain charity platform

- Smart contracts: ProposalManagement, DonationTracking, VotingGovernance, FundAllocation, CharityDAOPlatform
- Special Donations system with TransparencyLedger
- M-Pesa integration for Kenyan mobile payments
- React frontend with real-time updates
- Backend API with Express.js
- Hardhat configuration for Polygon deployment"
```

---

## **Step 7: Push to GitHub**

```powershell
# Push to GitHub (first time)
git branch -M main
git push -u origin main

# For future pushes, just use:
git push
```

**First push may ask for authentication:**
- Use your GitHub username
- Use a Personal Access Token (PAT) as password

---

## **Step 8: Generate GitHub Personal Access Token (if needed)**

If git asks for authentication:

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Set:
   - **Token name:** `mwanachi-charity-dao`
   - **Expiration:** 90 days
   - **Scopes:** Check `repo` (full control of private repositories)
4. Click **Generate token**
5. Copy the token (you won't see it again!)
6. Use as password when git asks

---

## **Step 9: Verify on GitHub**

1. Go to: https://github.com/Chaseway132/mwanachi-charity-dao
2. You should see all your files!
3. Check the commit message

---

## 📋 **What Gets Uploaded**

✅ **Uploaded:**
- All smart contracts
- Frontend code (React/TypeScript)
- Backend code (Node.js/Express)
- Hardhat configuration
- Deployment scripts
- Documentation files
- Package.json files

❌ **NOT Uploaded (protected by .gitignore):**
- `node_modules/` (dependencies)
- `.env` (private keys, API keys)
- `artifacts/` (compiled contracts)
- `cache/` (build cache)
- `.vscode/` (IDE settings)

---

## 🔐 **Security Checklist**

✅ `.env` file is in `.gitignore` - **PRIVATE KEYS ARE SAFE**
✅ `node_modules/` is in `.gitignore` - **Keeps repo small**
✅ `.git/` is not uploaded - **Git history stays local**

---

## 📝 **Create a Comprehensive README**

After pushing, create a README.md with:

```markdown
# Mwanachi Charity DAO

Blockchain-based charitable platform for Kenya with M-Pesa integration.

## Features

- ✅ Smart contracts on Polygon
- ✅ M-Pesa mobile payments
- ✅ Special donations system
- ✅ Real-time transparency
- ✅ DAO governance

## Quick Start

1. Clone: `git clone https://github.com/Chaseway132/mwanachi-charity-dao.git`
2. Install: `npm install`
3. Setup: Copy `.env.example` to `.env`
4. Run: `npm start`

## Documentation

- [Blockchain Status](./BLOCKCHAIN_STATUS_AND_DEPLOYMENT_PLAN.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Special Donations](./SPECIAL_DONATIONS_READY_TO_DEPLOY.md)
```

---

## 🚀 **Future Commits**

After the initial push, use:

```powershell
# Make changes, then:
git add .
git commit -m "Your commit message"
git push
```

---

## 📊 **Commit Message Format**

Use clear, descriptive messages:

```
git commit -m "feat: Add special donations system

- Create TransparencyLedger smart contract
- Add backend API endpoints
- Implement React components
- Add real-time updates"
```

---

## ✨ **All Done!**

Your project is now on GitHub! 🎉

**Next steps:**
1. Share the link with collaborators
2. Set up branch protection rules
3. Enable GitHub Actions for CI/CD
4. Add collaborators if needed

---

## 📞 **Troubleshooting**

### **"fatal: not a git repository"**
```powershell
git init
```

### **"Permission denied (publickey)"**
- Generate SSH key or use HTTPS with PAT
- See: https://docs.github.com/en/authentication

### **"Everything up-to-date"**
- No changes to commit
- Make changes and try again

---

## 🎯 **You're Ready!**

Follow the steps above and your project will be on GitHub! 🚀

