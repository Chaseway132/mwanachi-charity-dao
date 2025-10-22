# 🚀 Free Backend Hosting Options

## Comparison of Free Tier Services

| Service | Free Tier | Uptime | Cold Start | Best For |
|---------|-----------|--------|-----------|----------|
| **Railway** | $5/month credit | 99.9% | ~1-2s | Best option now |
| **Render** | 750 hours/month | 99.9% | ~30s | Good alternative |
| **Heroku** | ❌ Removed | - | - | No longer free |
| **Replit** | Limited | 95% | ~5s | Development only |
| **Fly.io** | $3/month credit | 99.9% | ~1s | Good option |

## Recommended: Railway.app

### Why Railway?
- ✅ $5/month free credit (enough for small projects)
- ✅ Fast deployment (1-2 seconds)
- ✅ Good uptime
- ✅ Easy GitHub integration
- ✅ Environment variables support
- ✅ Database support included

### Step 1: Create Railway Account

```
1. Go to https://railway.app
2. Click "Start Project"
3. Sign up with GitHub (recommended)
4. Authorize Railway
```

### Step 2: Create New Project

```
1. Click "New Project"
2. Select "Deploy from GitHub"
3. Select your Mwanachi repository
4. Select "charity-dao-frontend" or "backend" folder
```

### Step 3: Configure Environment Variables

```
1. Go to project settings
2. Click "Variables"
3. Add all variables from .env.production:

MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_BUSINESS_SHORTCODE=xxx
MPESA_PASSKEY=xxx
MPESA_ENVIRONMENT=production
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=xxx
BACKEND_URL=https://your-railway-url.railway.app
NODE_ENV=production
```

### Step 4: Deploy

```
1. Railway auto-deploys on git push
2. Or click "Deploy" button manually
3. Wait for build to complete
4. Get your URL from "Deployments" tab
```

### Step 5: Get Your Backend URL

```
1. Go to "Settings"
2. Copy the Railway URL
3. Update BACKEND_URL in environment variables
4. Update frontend to use this URL
```

## Alternative: Render.com

### Step 1: Create Account

```
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render
```

### Step 2: Create Web Service

```
1. Click "New +"
2. Select "Web Service"
3. Connect GitHub repository
4. Select branch: main
5. Select root directory: backend
```

### Step 3: Configure

```
Build Command: npm install
Start Command: npm start
Environment: Node
```

### Step 4: Add Environment Variables

```
1. Go to "Environment"
2. Add all variables from .env.production
3. Click "Deploy"
```

### Step 5: Get URL

```
Your URL will be: https://your-service-name.onrender.com
```

## Alternative: Fly.io

### Step 1: Install Fly CLI

```bash
# On Windows (using PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from https://fly.io/docs/getting-started/installing-flyctl/
```

### Step 2: Create Account

```bash
fly auth signup
# Or: fly auth login
```

### Step 3: Initialize Project

```bash
cd backend
fly launch
```

Follow prompts:
- App name: mwanachi-charity-backend
- Region: Choose closest to Kenya (Europe or Africa)
- Database: No (use external)

### Step 4: Set Environment Variables

```bash
fly secrets set MPESA_CONSUMER_KEY=xxx
fly secrets set MPESA_CONSUMER_SECRET=xxx
fly secrets set MPESA_BUSINESS_SHORTCODE=xxx
fly secrets set MPESA_PASSKEY=xxx
fly secrets set POLYGON_RPC_URL=https://polygon-rpc.com
fly secrets set PRIVATE_KEY=xxx
fly secrets set BACKEND_URL=https://mwanachi-charity-backend.fly.dev
```

### Step 5: Deploy

```bash
fly deploy
```

## Comparison: Which to Choose?

### Choose Railway if:
- ✅ You want easiest setup
- ✅ You want fast deployment
- ✅ You want good free tier
- ✅ You're comfortable with $5/month after free credit

### Choose Render if:
- ✅ You want completely free (750 hours/month)
- ✅ You don't mind 30-second cold starts
- ✅ You want simple interface

### Choose Fly.io if:
- ✅ You want global deployment
- ✅ You want $3/month credit
- ✅ You're comfortable with CLI

## Setting Up Backend for Production

### 1. Update backend/server.js

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/mpesa', require('./routes/mpesa'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/blockchain', require('./routes/blockchain'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. Update backend/package.json

```json
{
  "name": "charity-dao-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "axios": "^1.4.0",
    "ethers": "^6.15.0"
  }
}
```

### 3. Create Procfile (for Heroku-like services)

Create `backend/Procfile`:

```
web: npm start
```

## Monitoring Your Backend

### Railway Monitoring
```
1. Go to project
2. Click "Monitoring"
3. View logs, CPU, memory
4. Set up alerts
```

### Render Monitoring
```
1. Go to service
2. Click "Logs"
3. View real-time logs
4. Check metrics
```

### Fly.io Monitoring
```bash
fly logs
fly status
fly metrics
```

## Troubleshooting

### "Build failed"
- Check logs for errors
- Verify package.json exists
- Check Node version compatibility

### "Application crashed"
- Check logs for error messages
- Verify environment variables are set
- Check PORT is not hardcoded

### "Timeout errors"
- Increase timeout in service settings
- Check backend is responding to /health
- Verify database connection

### "M-Pesa callback not received"
- Verify callback URL is correct
- Check firewall allows incoming requests
- Verify BACKEND_URL in environment

## Cost Breakdown

### Railway
- Free: $5/month credit
- After: $0.50/GB RAM/month + $0.10/vCPU/month
- Typical backend: ~$5-10/month

### Render
- Free: 750 hours/month (enough for 1 service)
- Paid: $7/month for always-on

### Fly.io
- Free: $3/month credit
- After: $0.15/GB RAM/month + $0.30/vCPU/month

## Next Steps

1. Choose hosting service (Railway recommended)
2. Create account and project
3. Connect GitHub repository
4. Set environment variables
5. Deploy backend
6. Get backend URL
7. Update frontend to use backend URL
8. Test M-Pesa integration

---

**Your backend is now ready for free production hosting!** 🚀

For frontend, see GITHUB_PAGES_DEPLOYMENT.md
For M-Pesa setup, see MPESA_PRODUCTION_SETUP.md

