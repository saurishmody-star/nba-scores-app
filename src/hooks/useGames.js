import { useState, useEffect, useCallback } from 'react';
import { getGamesByDate, transformGame } from '../services/nbaApi';

/**
 * Custom hook to fetch and auto-refresh games for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} refreshInterval - Refresh interval in milliseconds (default: 30000ms = 30s)
 */
export const useGames = (date, refreshInterval = 30000) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchGames = useCallback(async () => {
    try {
      setError(null);
      const fetchedGames = await getGamesByDate(date);
      // Transform NBA.com data to our app format
      const transformedGames = fetchedGames.map(transformGame);
      setGames(transformedGames);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch games');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchGames();
  }, [fetchGames]);

  // Set up polling for live updates
  useEffect(() => {
    // Only poll if there are games
    if (games.length === 0) return;

    // Check if any games are currently live
    const hasLiveGames = games.some(game => {
      // NBA.com API status values: 'scheduled', 'live', 'final'
      return game.status === 'live';
    });

    // If there are live games, set up polling
    if (hasLiveGames) {
      const interval = setInterval(fetchGames, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [games, fetchGames, refreshInterval]);

  const refresh = () => {
    setLoading(true);
    fetchGames();
  };

  return {
    games,
    loading,
    error,
    lastUpdated,
    refresh
  };
};
