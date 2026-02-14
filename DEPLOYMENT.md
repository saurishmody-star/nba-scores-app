# NBA Scores App - Deployment Guide

## Deployment Options

### Option 1: Render (Recommended - Free Tier)

**Pros:**
- Free tier available
- Easy to set up
- Supports both frontend and backend
- Auto-deploys from GitHub

**Steps:**

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy Backend on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: nba-scores-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server/index.js`
     - **Environment Variables**: None needed
   - Click "Create Web Service"
   - Copy the backend URL (e.g., `https://nba-scores-backend.onrender.com`)

3. **Deploy Frontend on Render:**
   - Click "New +" → "Static Site"
   - Connect same GitHub repo
   - Configure:
     - **Name**: nba-scores-app
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Environment Variables**:
       - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - Click "Create Static Site"

### Option 2: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
npm install -g vercel
vercel
```
Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

**Backend on Render:** (Same as above)

### Option 3: Railway (All-in-one)

Railway can host both frontend and backend together:
- Go to [railway.app](https://railway.app)
- Deploy from GitHub
- Railway auto-detects and deploys both services

## Important Notes

### API Usage
- The app uses unofficial NBA.com APIs (free, public endpoints)
- No API keys required
- Data is publicly available on NBA.com

### Costs
- **Render Free Tier**:
  - Backend may sleep after 15 min of inactivity
  - 750 hours/month free
- **Vercel Free Tier**: Unlimited for personal projects
- **Railway Free Tier**: $5 credit/month

### Performance
- First load may be slow on free tiers (cold start)
- Consider paid tier ($7/month) for better performance

## Environment Variables Summary

**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Backend:**
```
PORT=3001  # Set automatically by hosting platform
```

## Post-Deployment

1. Test all features work
2. Check browser console for errors
3. Verify team logos load correctly
4. Test date navigation and live updates

## Monitoring

- Render provides built-in logs
- Check logs if games don't load
- NBA API endpoints are very reliable
