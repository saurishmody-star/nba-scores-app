import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors());
app.use(express.json());

// NBA API base URLs
const NBA_CDN_BASE = 'https://cdn.nba.com/static/json/liveData';
const NBA_STATS_BASE = 'https://stats.nba.com/stats';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL_TODAY = 10000; // 10 seconds for today's games (live updates)
const CACHE_TTL_HISTORICAL = 300000; // 5 minutes for historical games (don't change)
const CACHE_TTL_BOXSCORE = 15000; // 15 seconds for box scores

// Cache helper functions
function getCacheKey(prefix, identifier) {
  return `${prefix}_${identifier}`;
}

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key); // Remove expired cache
  return null;
}

function setCachedData(key, data, ttl) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Helper function to fetch from NBA CDN
async function fetchFromNBACDN(endpoint) {
  const url = `${NBA_CDN_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`NBA CDN Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper function to fetch from stats.nba.com (for date-specific queries)
async function fetchFromNBAStats(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${NBA_STATS_BASE}${endpoint}?${queryString}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.nba.com/',
      'Origin': 'https://www.nba.com',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`NBA Stats Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Proxy endpoint for scoreboard (with optional date parameter)
app.get('/api/scoreboard', async (req, res) => {
  try {
    const { date } = req.query;
    const cacheKey = getCacheKey('scoreboard', date || 'today');

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json(cachedData);
    }

    console.log(`❌ Cache MISS: ${cacheKey} - Fetching from NBA API...`);

    if (date) {
      // Use stats.nba.com API for specific dates
      // Format date as MM/DD/YYYY
      const [year, month, day] = date.split('-');
      const formattedDate = `${month}/${day}/${year}`;

      const data = await fetchFromNBAStats('/scoreboardv2', {
        GameDate: formattedDate,
        LeagueID: '00',
        DayOffset: '0',
      });

      // Transform the stats API response to match CDN format
      const transformed = transformStatsAPIResponse(data);

      // Cache historical games for longer (they don't change)
      setCachedData(cacheKey, transformed, CACHE_TTL_HISTORICAL);
      res.json(transformed);
    } else {
      // Use CDN for today's games
      const data = await fetchFromNBACDN('/scoreboard/todaysScoreboard_00.json');

      // Cache today's games for shorter time (live updates)
      setCachedData(cacheKey, data, CACHE_TTL_TODAY);
      res.json(data);
    }
  } catch (error) {
    console.error('Error fetching scoreboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transform stats.nba.com response to match CDN format
function transformStatsAPIResponse(statsData) {
  const games = [];

  if (!statsData.resultSets || statsData.resultSets.length < 2) {
    return { scoreboard: { games: [] } };
  }

  const gameHeader = statsData.resultSets[0]; // GameHeader
  const lineScore = statsData.resultSets[1];   // LineScore
  const teamStats = statsData.resultSets[5];   // Team stats (if available)

  if (!gameHeader.rowSet || gameHeader.rowSet.length === 0) {
    return { scoreboard: { games: [] } };
  }

  // Build game objects from the data
  gameHeader.rowSet.forEach((game) => {
    const gameId = game[2];                    // GAME_ID
    const gameStatusId = game[3];              // GAME_STATUS_ID
    const homeTeamId = game[6];                // HOME_TEAM_ID
    const visitorTeamId = game[7];             // VISITOR_TEAM_ID
    const gameDate = game[0];                  // GAME_DATE_EST
    const livePeriod = game[9] || 0;           // LIVE_PERIOD

    // Find team info from lineScore
    // LineScore structure: [GAME_DATE_EST, GAME_SEQUENCE, GAME_ID, TEAM_ID, TEAM_ABBREVIATION, TEAM_CITY_NAME, TEAM_NAME, ...]
    const homeLineScore = lineScore.rowSet.find(
      row => row[2] === gameId && row[3] === homeTeamId
    );
    const visitorLineScore = lineScore.rowSet.find(
      row => row[2] === gameId && row[3] === visitorTeamId
    );

    if (!homeLineScore || !visitorLineScore) {
      return; // Skip if we can't find the scores
    }

    games.push({
      gameId: gameId,
      gameDate: gameDate,
      gameStatus: gameStatusId,
      gameTimeUTC: gameDate,
      period: parseInt(livePeriod) || 0,
      gameClock: "",
      homeTeam: {
        teamId: homeTeamId,
        teamName: homeLineScore[6] || "",        // TEAM_NAME
        teamCity: homeLineScore[5] || "",        // TEAM_CITY_NAME
        teamTricode: homeLineScore[4] || "",     // TEAM_ABBREVIATION
        teamSlug: "",
        wins: 0,
        losses: 0,
        score: homeLineScore[22] || 0,           // PTS
        seed: null,
        inBonus: null,
        timeoutsRemaining: 0,
        periods: []
      },
      awayTeam: {
        teamId: visitorTeamId,
        teamName: visitorLineScore[6] || "",     // TEAM_NAME
        teamCity: visitorLineScore[5] || "",     // TEAM_CITY_NAME
        teamTricode: visitorLineScore[4] || "",  // TEAM_ABBREVIATION
        teamSlug: "",
        wins: 0,
        losses: 0,
        score: visitorLineScore[22] || 0,        // PTS
        seed: null,
        inBonus: null,
        timeoutsRemaining: 0,
        periods: []
      }
    });
  });

  return { scoreboard: { games, gameDate: gameHeader.rowSet[0]?.[0] || "" } };
}

// Proxy endpoint for box score
app.get('/api/boxscore/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const cacheKey = getCacheKey('boxscore', gameId);

    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json(cachedData);
    }

    console.log(`❌ Cache MISS: ${cacheKey} - Fetching from NBA API...`);

    const data = await fetchFromNBACDN(`/boxscore/boxscore_${gameId}.json`);

    // Cache box score data
    setCachedData(cacheKey, data, CACHE_TTL_BOXSCORE);
    res.json(data);
  } catch (error) {
    console.error('Error fetching box score:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NBA Scores API Proxy is running' });
});

app.listen(PORT, () => {
  console.log(`🏀 NBA API Proxy running on http://localhost:${PORT}`);
  console.log(`📊 Scoreboard: http://localhost:${PORT}/api/scoreboard`);
  console.log(`📅 With date: http://localhost:${PORT}/api/scoreboard?date=YYYY-MM-DD`);
});
