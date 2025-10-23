# 🗄️ MongoDB Setup Guide - Data Persistence

## 🎯 What This Does

Implements **persistent database storage** for campaigns so they survive backend restarts.

**Before:** Campaigns lost when backend restarts ❌  
**After:** Campaigns persist forever ✅

---

## 📋 Setup Options

### Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ⭐

**Best for:** Production, Render deployment, no local setup

#### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Sign Up"
3. Create account with email
4. Verify email

#### Step 2: Create Free Cluster
1. Click "Create" → "Build a Database"
2. Select "Free" tier
3. Choose cloud provider: AWS
4. Choose region: us-east-1 (or closest to you)
5. Click "Create Cluster"
6. Wait 2-3 minutes for cluster to be ready

#### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `mwanachi_admin`
4. Password: Generate secure password (save it!)
5. Click "Add User"

#### Step 4: Whitelist IP Address
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Databases"
2. Click "Connect"
3. Select "Drivers"
4. Copy connection string
5. Replace `<username>` and `<password>` with your credentials

**Example:**
```
mongodb+srv://mwanachi_admin:YOUR_PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
```

#### Step 6: Update .env
```bash
MONGODB_URI=mongodb+srv://mwanachi_admin:YOUR_PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
```

---

### Option 2: Local MongoDB - For Development

**Best for:** Local testing, no internet required

#### Step 1: Install MongoDB
**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install MongoDB Compass (optional)

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Step 2: Verify Installation
```bash
mongosh
# Should show: test>
# Type: exit
```

#### Step 3: Update .env
```
MONGODB_URI=mongodb://localhost:27017/mwanachi-charity-dao
```

---

### Option 3: Render PostgreSQL - Alternative

**Best for:** Render deployment, integrated with backend

1. Go to Render dashboard
2. Create PostgreSQL database
3. Copy connection string
4. Update backend to use PostgreSQL driver

---

## 🚀 Deployment to Render

### Step 1: Update Render Environment Variables
1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Add new variable:
   ```
   MONGODB_URI=mongodb+srv://mwanachi_admin:PASSWORD@cluster0.mongodb.net/mwanachi-charity-dao?retryWrites=true&w=majority
   ```
5. Click "Save Changes"
6. Backend will restart automatically

### Step 2: Verify Connection
```bash
curl https://your-render-url/health
# Should return: {"status":"ok"}
```

### Step 3: Test Campaign Creation
1. Create campaign in admin panel
2. Go to "Special Causes"
3. Campaign should appear
4. Restart backend
5. Campaign should still appear ✅

---

## 🧪 Testing

### Test 1: Create Campaign
```bash
# Login first
curl -X POST https://your-render-url/api/admin/login-simple \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy the token from response

# Create campaign
curl -X POST https://your-render-url/api/special-donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Campaign",
    "description": "Testing MongoDB",
    "beneficiaryName": "Test Beneficiary",
    "targetAmount": 100000,
    "location": "Nairobi",
    "category": "emergency"
  }'
```

### Test 2: Verify Campaign Persists
```bash
# Get all campaigns
curl https://your-render-url/api/special-donations

# Should show your campaign in the list
# Response includes: "storage": "MongoDB"
```

### Test 3: Backend Restart
1. Restart backend on Render
2. Get campaigns again
3. Your campaign should still be there ✅

---

## 📊 What's Stored

### Campaigns Collection
```javascript
{
  id: 1,
  title: "Campaign Title",
  beneficiaryName: "Beneficiary",
  description: "Description",
  targetAmount: 100000,
  currentAmount: 0,
  totalDonors: 0,
  deadline: "2025-11-23T...",
  verified: true,
  closed: false,
  location: "Nairobi",
  category: "emergency",
  createdAt: "2025-10-23T...",
  updatedAt: "2025-10-23T...",
  updates: [...],
  donations: [...],
  documents: [...]
}
```

---

## 🔄 Data Migration

### Migrate Existing Campaigns
If you have campaigns in memory, they'll be migrated automatically:

1. Backend starts
2. Checks if MongoDB is connected
3. If yes: Uses MongoDB
4. If no: Uses in-memory storage
5. New campaigns go to whichever is available

---

## ⚠️ Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- Verify credentials are correct

### Campaigns Still Not Persisting
```
Check: curl https://your-render-url/api/special-donations
Look for: "storage": "MongoDB" or "storage": "Memory"
```

If showing "Memory":
- MongoDB not connected
- Check Render logs
- Verify MONGODB_URI environment variable

### Connection String Issues
```
Error: Invalid connection string
```
**Solution:**
- Copy exact string from MongoDB Atlas
- Replace <username> and <password>
- No angle brackets in final string
- URL encode special characters

---

## 🔐 Security Notes

### Production Checklist
- [ ] Use strong password for MongoDB user
- [ ] Whitelist only necessary IP addresses
- [ ] Enable IP whitelist on MongoDB Atlas
- [ ] Use environment variables for credentials
- [ ] Never commit .env to git
- [ ] Enable MongoDB encryption
- [ ] Set up automated backups

### Development Checklist
- [ ] Use local MongoDB for testing
- [ ] Use test database name
- [ ] Don't use production credentials
- [ ] Clear test data regularly

---

## 📈 Performance Tips

### Indexes
Already created for:
- `createdAt` - For sorting campaigns
- `category` - For filtering
- `verified` - For status queries

### Query Optimization
- Campaigns sorted by newest first
- Pagination ready (add limit/skip)
- Efficient filtering by category

---

## 🎯 Next Steps

1. **Choose setup option** (Atlas recommended)
2. **Get connection string**
3. **Update .env file**
4. **Restart backend**
5. **Test campaign creation**
6. **Verify persistence**

---

## 📚 Resources

- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- Connection String: https://docs.mongodb.com/manual/reference/connection-string/

---

## ✅ Success Indicators

- [x] Mongoose installed
- [x] Campaign model created
- [x] Database connection utility created
- [x] Routes updated to use MongoDB
- [x] Fallback to memory if MongoDB unavailable
- [x] Environment variable support
- [ ] MongoDB configured (YOUR TURN)
- [ ] Backend restarted with MongoDB
- [ ] Campaign created and persisted
- [ ] Campaign survives backend restart

---

## 🎉 Result

After setup:
- ✅ Campaigns persist forever
- ✅ Survive backend restarts
- ✅ Production-ready
- ✅ Scalable
- ✅ Secure

---

**Let's make your data persistent! 🚀**

