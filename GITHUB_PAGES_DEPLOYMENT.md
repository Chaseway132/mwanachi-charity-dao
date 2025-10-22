# 🚀 GitHub Pages Deployment Guide

## Current Status

✅ You have `index.html` in `charity-dao-frontend/public/`
✅ You have built files in `charity-dao-frontend/build/`
⚠️ GitHub Pages needs proper configuration

## Why GitHub Pages Failed Before

Common issues:
1. **Missing `homepage` in package.json** - Routes don't work
2. **Wrong build folder** - GitHub Pages looks in `docs/` or `gh-pages` branch
3. **Client-side routing issues** - React Router needs special config
4. **Missing 404.html** - SPA routing breaks on refresh

## Step 1: Configure package.json

Add homepage field to `charity-dao-frontend/package.json`:

```json
{
  "name": "charity-dao-frontend",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://YOUR_USERNAME.github.io/Mwanachi-Charity-DAO",
  ...
}
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 2: Create 404.html for SPA Routing

Create `charity-dao-frontend/public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Mwanachi Charity DAO</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;

      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/')
          .replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

## Step 3: Update index.html

Your `charity-dao-frontend/public/index.html` already has the correct structure. Just verify:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Mwanachi Charity DAO - Transparent Charity Platform" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Mwanachi Charity DAO</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

## Step 4: Update React Router Configuration

In `charity-dao-frontend/src/App.tsx`, ensure React Router is configured for GitHub Pages:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL || '/'}>
      <Routes>
        {/* Your routes */}
      </Routes>
    </Router>
  );
}
```

## Step 5: Build for Production

```bash
cd charity-dao-frontend
npm run build
```

This creates optimized files in `build/` folder.

## Step 6: Deploy to GitHub Pages

### Option A: Using GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd charity-dao-frontend
          npm install
      
      - name: Build
        run: |
          cd charity-dao-frontend
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./charity-dao-frontend/build
          cname: your-custom-domain.com  # Optional: if using custom domain
```

### Option B: Manual Deployment

```bash
# 1. Build the project
cd charity-dao-frontend
npm run build

# 2. Create gh-pages branch if it doesn't exist
git checkout --orphan gh-pages

# 3. Remove all files except build
git rm -rf .

# 4. Copy build files to root
cp -r build/* .
rm -rf build

# 5. Create .nojekyll file (tells GitHub to serve as-is)
touch .nojekyll

# 6. Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 7. Go back to main branch
git checkout main
```

## Step 7: Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages` (or `main` if using Actions)
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment

## Step 8: Verify Deployment

1. Go to `https://YOUR_USERNAME.github.io/Mwanachi-Charity-DAO`
2. Check if site loads
3. Test navigation (click different tabs)
4. Check browser console for errors

## Troubleshooting

### "404 Not Found"
- Verify `homepage` in package.json is correct
- Check GitHub Pages settings point to correct branch
- Wait 2-3 minutes after push

### "Blank page"
- Check browser console for errors (F12)
- Verify `404.html` is in public folder
- Check `basename` in React Router

### "Routes not working"
- Verify `404.html` is deployed
- Check `basename` matches `homepage`
- Clear browser cache (Ctrl+Shift+Delete)

### "Styles not loading"
- Check CSS file paths in build folder
- Verify `homepage` doesn't have trailing slash
- Check `PUBLIC_URL` environment variable

## Environment Variables for GitHub Pages

Create `.env.production` in `charity-dao-frontend/`:

```
REACT_APP_BACKEND_URL=https://your-backend-api.com
REACT_APP_POLYGON_RPC_URL=https://polygon-rpc.com
REACT_APP_CHAIN_ID=137
PUBLIC_URL=/Mwanachi-Charity-DAO
```

## Custom Domain (Optional)

If you want `charity-dao.com` instead of GitHub Pages URL:

1. Create `CNAME` file in `public/` folder:
```
charity-dao.com
```

2. Update DNS records at your domain registrar:
```
CNAME: www.charity-dao.com → YOUR_USERNAME.github.io
A: charity-dao.com → 185.199.108.153
```

3. In GitHub Pages settings, add custom domain

## Performance Tips

1. **Enable Gzip compression** - GitHub Pages does this automatically
2. **Optimize images** - Use WebP format
3. **Code splitting** - React does this automatically
4. **Lazy loading** - Load components on demand

## Monitoring

Check deployment status:
1. Go to repository → **Actions**
2. View workflow runs
3. Check for errors in logs

## Free Tier Limits

- ✅ Unlimited deployments
- ✅ 1 GB storage
- ✅ 100 GB bandwidth/month
- ✅ Custom domain support
- ✅ HTTPS included

## Next Steps

1. Update `package.json` with homepage
2. Create `404.html` in public folder
3. Build project: `npm run build`
4. Set up GitHub Actions or manual deployment
5. Configure GitHub Pages settings
6. Test at your GitHub Pages URL

---

**Your frontend is now ready for free hosting on GitHub Pages!** 🚀

For backend, see FREE_BACKEND_HOSTING.md

