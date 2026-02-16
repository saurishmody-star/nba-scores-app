# NBA Scores App - Project Overview

## Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express.js proxy server
- **API**: NBA.com unofficial public endpoints (NO API KEY REQUIRED)

### Why a Backend Proxy?
The app uses an Express backend as a proxy to bypass CORS restrictions when calling NBA.com APIs directly from the browser.

---

## API Strategy & Key Decisions

### ✅ Final Solution: NBA.com Public API (Free, No Key)
**Endpoints Used:**
1. **Today's Scoreboard**: `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`
2. **Historical Scores**: `https://stats.nba.com/stats/scoreboardv2`
3. **Box Scores**: `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_{gameId}.json`

**What Works:**
- ✅ Live scores
- ✅ Today's games
- ✅ Historical games (any date)
- ✅ Detailed box scores
- ✅ Player statistics
- ✅ Team stats
- ✅ 100% free, no API key needed
- ✅ Reliable (directly from NBA.com)

---

## Challenges & Solutions

### Challenge 1: CORS Restrictions
**Problem**: Browser blocks direct requests to NBA.com APIs due to CORS policy.

**Solution**: Created Express backend proxy server (PORT 3001) that:
- Fetches data from NBA.com on behalf of frontend
- Adds proper headers (User-Agent, Referer, etc.)
- Returns data to frontend without CORS issues

### Challenge 2: Different API Formats for Different Dates
**Problem**: NBA.com uses two different APIs:
- CDN API for today's games (simple JSON)
- Stats API for historical games (complex ResultSet format)

**Solution**: Backend transforms stats API response to match CDN format (see `transformStatsAPIResponse()` in [server/index.js](server/index.js:86-162))

### Challenge 3: Real-time Updates
**Problem**: Need live score updates during games.

**Solution**: Frontend polls API every 30 seconds for live games (see [useGames.js](src/hooks/useGames.js))

---

## Key Features

1. **Date Navigation**: View scores from any date
2. **Live Updates**: Auto-refresh every 30 seconds
3. **Box Scores**: Click any game to see detailed player stats
4. **Mobile Responsive**: Works on all screen sizes
5. **Team Logos**: Custom SVG logos for all 30 NBA teams
6. **Game Status**: Shows scheduled/live/final states
7. **Vertical Score List**: Games displayed in a clean vertical layout

---

## Component Structure

```
src/
├── App.jsx                    # Main app container
├── components/
│   ├── GameCard.jsx          # Individual game score card
│   ├── BoxScore.jsx          # Detailed stats view
│   ├── DateSelector.jsx      # Date picker
│   └── LoadingSpinner.jsx    # Loading states
├── hooks/
│   └── useGames.js           # API data fetching logic
├── services/
│   └── nbaApi.js             # API wrapper functions
└── utils/
    └── teamLogos.jsx         # SVG logos for all teams
```

---

## Environment Variables

### Current .env File (INCORRECT):
```
VITE_BALLDONTLIE_API_KEY=y0cdaf52e-cca3-4472-bd15-2539c23505fa
```
**⚠️ This is NOT used by the app!** The app doesn't use BallDontLie API.

### For Local Development:
No environment variables needed! Just run:
```bash
npm run dev
```

### For Production Deployment:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Why Not BallDontLie API?

**Possible reasons this was changed:**
1. ❌ Free tier may have limited box score access
2. ❌ Rate limits might be too restrictive
3. ❌ May not have real-time updates
4. ✅ NBA.com API is more comprehensive and free

The `.env` file with BallDontLie API key suggests this was initially attempted but then switched to NBA.com's direct API.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

**Quick Summary:**
- Backend: Deploy to Render/Railway (Node.js app)
- Frontend: Deploy to Vercel/Render (Static site)
- Set `VITE_API_URL` to point to deployed backend

---

## Development Commands

```bash
# Install dependencies
npm install

# Run both frontend + backend concurrently
npm run dev

# Run only frontend (port 5173)
npm run client

# Run only backend (port 3001)
npm run server

# Build for production
npm run build
```

---

## API Rate Limits & Reliability

**NBA.com Public API:**
- No official rate limits (it's a public CDN)
- Very reliable (serves nba.com itself)
- Data updates in real-time during games
- No authentication required

**Best Practice:** Don't abuse the API. The 30-second polling interval is reasonable.

---

## Future Enhancements

Potential improvements:
- Add player headshots
- Show team standings
- Add game highlights links
- Playoff bracket view
- Favorite teams
- Push notifications for live games

---

## Troubleshooting

### Scores not loading?
1. Check if backend is running (`npm run server`)
2. Check browser console for errors
3. Verify NBA.com APIs are accessible

### CORS errors?
- Make sure you're using the backend proxy
- Don't call NBA.com APIs directly from frontend

### Old scores showing?
- Click the Refresh button
- Check if `lastUpdated` timestamp is recent

---

## License & Credits

**Data Source:** NBA.com (unofficial public API)
**Built with:** React, Vite, Express, Tailwind CSS
**Team Logos:** Custom SVG implementations

---

## Original Conversation Context

The full conversation history where this was built would be in:
- **Claude Code CLI**: Terminal history
- **Claude.ai**: Conversation history at https://claude.ai/recents
- **VS Code Extension**: Conversation panel

This document serves as a reverse-engineered overview based on the codebase.
