// Backend proxy URL - uses environment variable in production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to make API requests to our backend
const fetchFromBackend = async (endpoint) => {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Fetch games for today
 */
export const getGamesToday = async () => {
  try {
    const data = await fetchFromBackend('/scoreboard');
    return data.scoreboard?.games || [];
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return [];
  }
};

/**
 * Fetch games for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const getGamesByDate = async (date) => {
  try {
    // Pass date parameter to backend
    const data = await fetchFromBackend(`/scoreboard?date=${date}`);
    const games = data.scoreboard?.games || [];
    return games;
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return [];
  }
};

/**
 * Fetch detailed box score for a specific game
 * @param {string} gameId - The ID of the game
 */
export const getBoxScore = async (gameId) => {
  try {
    const data = await fetchFromBackend(`/boxscore/${gameId}`);
    return data.game || null;
  } catch (error) {
    console.error('Failed to fetch box score:', error);
    return null;
  }
};

/**
 * Transform NBA.com game data to match our app's format
 * @param {Object} game - NBA.com game object
 */
export const transformGame = (game) => {
  return {
    id: game.gameId,
    date: game.gameTimeUTC,
    status: getGameStatus(game.gameStatus),
    period: game.period,
    time: game.gameClock,
    home_team: {
      id: game.homeTeam.teamId,
      abbreviation: game.homeTeam.teamTricode,
      city: game.homeTeam.teamCity || game.homeTeam.teamName,
      full_name: game.homeTeam.teamCity
        ? `${game.homeTeam.teamCity} ${game.homeTeam.teamName}`
        : game.homeTeam.teamName,
      name: game.homeTeam.teamName,
    },
    visitor_team: {
      id: game.awayTeam.teamId,
      abbreviation: game.awayTeam.teamTricode,
      city: game.awayTeam.teamCity || game.awayTeam.teamName,
      full_name: game.awayTeam.teamCity
        ? `${game.awayTeam.teamCity} ${game.awayTeam.teamName}`
        : game.awayTeam.teamName,
      name: game.awayTeam.teamName,
    },
    home_team_score: game.homeTeam.score || 0,
    visitor_team_score: game.awayTeam.score || 0,
  };
};

/**
 * Get game status text from status code
 * @param {number} statusCode - NBA API status code
 */
const getGameStatus = (statusCode) => {
  switch (statusCode) {
    case 1:
      return 'scheduled';
    case 2:
      return 'live';
    case 3:
      return 'final';
    default:
      return 'unknown';
  }
};

/**
 * Calculate team totals from team statistics
 * @param {Object} teamStats - Team stats object with statistics property
 */
export const calculateTeamTotals = (teamStats) => {
  if (!teamStats || !teamStats.statistics) {
    return {
      pts: 0,
      reb: 0,
      ast: 0,
      stl: 0,
      blk: 0,
      turnover: 0,
      fgm: 0,
      fga: 0,
      fg3m: 0,
      fg3a: 0,
      ftm: 0,
      fta: 0,
      fg_pct: '0.0',
      fg3_pct: '0.0',
      ft_pct: '0.0',
    };
  }

  const stats = teamStats.statistics;
  return {
    pts: stats.points || 0,
    reb: stats.reboundsTotal || 0,
    ast: stats.assists || 0,
    stl: stats.steals || 0,
    blk: stats.blocks || 0,
    turnover: stats.turnovers || 0,
    fgm: stats.fieldGoalsMade || 0,
    fga: stats.fieldGoalsAttempted || 0,
    fg3m: stats.threePointersMade || 0,
    fg3a: stats.threePointersAttempted || 0,
    ftm: stats.freeThrowsMade || 0,
    fta: stats.freeThrowsAttempted || 0,
    fg_pct: ((stats.fieldGoalsPercentage || 0) * 100).toFixed(1),
    fg3_pct: ((stats.threePointersPercentage || 0) * 100).toFixed(1),
    ft_pct: ((stats.freeThrowsPercentage || 0) * 100).toFixed(1),
  };
};

/**
 * Fetch game stats in a format compatible with the app
 * @param {string} gameId - The ID of the game
 */
export const getGameStats = async (gameId) => {
  try {
    const boxScore = await getBoxScore(gameId);

    if (!boxScore) {
      return {
        homeTeam: null,
        visitorTeam: null,
        homeTeamPlayers: [],
        visitorTeamPlayers: []
      };
    }

    return {
      homeTeam: boxScore.homeTeam || null,
      visitorTeam: boxScore.awayTeam || null,
      homeTeamPlayers: boxScore.homeTeam?.players || [],
      visitorTeamPlayers: boxScore.awayTeam?.players || [],
    };
  } catch (error) {
    console.error('Failed to fetch game stats:', error);
    return {
      homeTeam: null,
      visitorTeam: null,
      homeTeamPlayers: [],
      visitorTeamPlayers: []
    };
  }
};
