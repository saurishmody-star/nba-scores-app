# NBA Scores App - Claude Context

## Quick Start
```bash
npm install
npm run dev  # Runs both frontend (5173) and backend (3001)
```

## Architecture
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Express proxy server (bypasses CORS)
- **API**: NBA.com unofficial public API (no key needed)

## Key Decisions

### Why NBA.com API instead of BallDontLie?
Initially tried BallDontLie API but switched because:
- Free tier lacked full box score access
- NBA.com API is more comprehensive and 100% free
- Direct access to real-time data

### Why Backend Proxy?
NBA.com APIs have CORS restrictions. Express server acts as proxy:
- Adds proper headers (User-Agent, Referer)
- Transforms different API response formats
- Located in `/server/index.js`

### API Endpoints Used
1. **Today's games**: `cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`
2. **Historical games**: `stats.nba.com/stats/scoreboardv2`
3. **Box scores**: `cdn.nba.com/static/json/liveData/boxscore/boxscore_{gameId}.json`

## Features
- ✅ Live scores with 30-second auto-refresh
- ✅ Historical game data (any date)
- ✅ Detailed box scores and player stats
- ✅ Mobile responsive
- ✅ Vertical score list layout
- ✅ Custom team logos (SVG)

## Environment Variables

### Development
No `.env` file needed for local development!

### Production
Only need one variable in hosting platform:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for full guide.

**Quick summary:**
- Backend → Render/Railway (Node.js)
- Frontend → Vercel/Render (Static site)

## Troubleshooting

### Scores not loading?
1. Ensure backend is running: `npm run server`
2. Check browser console for errors
3. Verify backend is accessible at `http://localhost:3001/api/health`

### CORS errors?
- Always use backend proxy, never call NBA.com directly from frontend
- Check `VITE_API_URL` points to correct backend

## Component Structure
```
src/
├── App.jsx                 # Main container with vertical score layout
├── components/
│   ├── GameCard.jsx       # Individual game card
│   ├── BoxScore.jsx       # Detailed stats modal
│   ├── DateSelector.jsx   # Date navigation
│   └── LoadingSpinner.jsx
├── hooks/
│   └── useGames.js        # Fetching logic with 30s polling
├── services/
│   └── nbaApi.js          # API wrapper functions
└── utils/
    └── teamLogos.jsx      # All 30 team SVG logos
```

## Recent Changes
- **2024-02-16**: Changed score list from horizontal scroll to vertical layout (all screen sizes)

## Known Limitations
- NBA.com API is unofficial (but very reliable)
- Free tier on Render causes cold starts (~30s first load)
- No official rate limits, but polling set to 30s to be respectful

## Future Ideas
- Player headshots
- Team standings
- Playoff bracket view
- Favorite teams with localStorage
- Push notifications for live games
