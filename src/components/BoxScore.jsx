import { useState, useEffect } from 'react';
import { getGameStats, calculateTeamTotals } from '../services/nbaApi';
import { LoadingSpinner } from './LoadingSpinner';
import { getTeamLogoUrl } from '../utils/teamLogos.jsx';

export const BoxScore = ({ game, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoxScore = async () => {
      try {
        setLoading(true);
        const gameStats = await getGameStats(game.id);
        console.log('Box score data:', gameStats);
        setStats(gameStats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxScore();
  }, [game.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-semibold mb-2">Failed to load box score</div>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  if (!stats || (!stats.homeTeamPlayers?.length && !stats.visitorTeamPlayers?.length)) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Box score not yet available for this game</div>
      </div>
    );
  }

  const homeTeamTotals = calculateTeamTotals(stats.homeTeam);
  const visitorTeamTotals = calculateTeamTotals(stats.visitorTeam);

  // Get all players sorted by minutes played
  const getActivePlayers = (players) => {
    return [...(players || [])]
      .filter(player => player.status === 'ACTIVE' && player.played === '1')
      .sort((a, b) => {
        const minsA = parseFloat(b.statistics?.minutes || '0');
        const minsB = parseFloat(a.statistics?.minutes || '0');
        return minsB - minsA;
      });
  };

  const visitorPlayers = getActivePlayers(stats.visitorTeamPlayers);
  const homePlayers = getActivePlayers(stats.homeTeamPlayers);

  const StatRow = ({ label, visitorValue, homeValue }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <div className="w-24 text-right text-lg font-semibold text-gray-900">{visitorValue}</div>
      <div className="flex-1 text-center text-sm font-medium text-gray-600">{label}</div>
      <div className="w-24 text-left text-lg font-semibold text-gray-900">{homeValue}</div>
    </div>
  );

  // Helper to format minutes from "PT12M34.00S" to "12:34"
  const formatMinutes = (minutesStr) => {
    if (!minutesStr) return '0:00';
    const match = minutesStr.match(/PT(\d+)M([\d.]+)S/);
    if (match) {
      const mins = match[1];
      const secs = Math.floor(parseFloat(match[2])).toString().padStart(2, '0');
      return `${mins}:${secs}`;
    }
    return minutesStr;
  };

  // Helper to calculate shooting percentage
  const calcPercentage = (made, attempted) => {
    if (!attempted || attempted === 0) return '0.0';
    return ((made / attempted) * 100).toFixed(1);
  };

  const PlayerRow = ({ player }) => {
    const stats = player.statistics || {};
    const fgPct = calcPercentage(stats.fieldGoalsMade, stats.fieldGoalsAttempted);
    const fg3Pct = calcPercentage(stats.threePointersMade, stats.threePointersAttempted);
    const ftPct = calcPercentage(stats.freeThrowsMade, stats.freeThrowsAttempted);

    return (
      <div className="grid grid-cols-12 gap-2 py-3 border-b border-gray-50 last:border-b-0 text-sm">
        <div className="col-span-2">
          <div className="font-medium text-gray-900">
            {player.nameI || player.name || 'Unknown'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {player.position || '-'}
          </div>
        </div>
        <div className="col-span-1 text-center text-gray-600">{formatMinutes(stats.minutes)}</div>
        <div className="col-span-1 text-center font-semibold text-gray-900">{stats.points || 0}</div>
        <div className="col-span-2 text-center text-gray-600">
          <div>{stats.fieldGoalsMade || 0}-{stats.fieldGoalsAttempted || 0}</div>
          <div className="text-xs text-gray-500">{fgPct}%</div>
        </div>
        <div className="col-span-2 text-center text-gray-600">
          <div>{stats.threePointersMade || 0}-{stats.threePointersAttempted || 0}</div>
          <div className="text-xs text-gray-500">{fg3Pct}%</div>
        </div>
        <div className="col-span-1 text-center text-gray-600">
          <div>{stats.freeThrowsMade || 0}-{stats.freeThrowsAttempted || 0}</div>
          <div className="text-xs text-gray-500">{ftPct}%</div>
        </div>
        <div className="col-span-1 text-center text-gray-600">{stats.reboundsTotal || 0}</div>
        <div className="col-span-1 text-center text-gray-600">{stats.assists || 0}</div>
        <div className="col-span-1 text-center text-gray-600">{stats.steals || 0}/{stats.turnovers || 0}</div>
      </div>
    );
  };

  const PlayerTableHeader = () => (
    <div className="grid grid-cols-12 gap-2 py-2 border-b-2 border-gray-300 text-xs font-semibold text-gray-600 uppercase">
      <div className="col-span-2">Player</div>
      <div className="col-span-1 text-center">Min</div>
      <div className="col-span-1 text-center">Pts</div>
      <div className="col-span-2 text-center">FG</div>
      <div className="col-span-2 text-center">3PT</div>
      <div className="col-span-1 text-center">FT</div>
      <div className="col-span-1 text-center">Reb</div>
      <div className="col-span-1 text-center">Ast</div>
      <div className="col-span-1 text-center">Stl/TO</div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header with Game Info */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Box Score</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close box score"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Game Score Header */}
          <div className="grid grid-cols-3 gap-6 items-center">
            {/* Visitor Team */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img
                  src={getTeamLogoUrl(game.visitor_team.abbreviation)}
                  alt={game.visitor_team.abbreviation}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="font-bold text-gray-900 text-lg">{game.visitor_team.full_name}</div>
              <div className="text-4xl font-bold text-gray-900 mt-3">{game.visitor_team_score}</div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {game.status === 'final' ? 'Final' : game.status === 'live' ? 'Live' : 'vs'}
              </div>
              {game.period && game.status !== 'scheduled' && (
                <div className="text-xs text-gray-400 mt-1 font-medium">
                  {game.status === 'final' ? '' : `Quarter ${game.period}`}
                </div>
              )}
            </div>

            {/* Home Team */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img
                  src={getTeamLogoUrl(game.home_team.abbreviation)}
                  alt={game.home_team.abbreviation}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="font-bold text-gray-900 text-lg">{game.home_team.full_name}</div>
              <div className="text-4xl font-bold text-gray-900 mt-3">{game.home_team_score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Score Content */}
      <div className="p-6 space-y-8">
        {/* Team Stats Comparison */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Team Statistics</h3>
          <div className="mb-4 flex justify-between items-center text-sm font-semibold">
            <div className="flex items-center gap-2">
              <img
                src={getTeamLogoUrl(game.visitor_team.abbreviation)}
                alt={game.visitor_team.abbreviation}
                className="w-6 h-6 object-contain"
              />
              <span className="text-gray-700">{game.visitor_team.abbreviation}</span>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">{game.home_team.abbreviation}</span>
              <img
                src={getTeamLogoUrl(game.home_team.abbreviation)}
                alt={game.home_team.abbreviation}
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
          <StatRow
            label="Field Goal %"
            visitorValue={`${visitorTeamTotals.fg_pct}%`}
            homeValue={`${homeTeamTotals.fg_pct}%`}
          />
          <StatRow
            label="3-Point %"
            visitorValue={`${visitorTeamTotals.fg3_pct}%`}
            homeValue={`${homeTeamTotals.fg3_pct}%`}
          />
          <StatRow
            label="Free Throw %"
            visitorValue={`${visitorTeamTotals.ft_pct}%`}
            homeValue={`${homeTeamTotals.ft_pct}%`}
          />
          <StatRow
            label="Rebounds"
            visitorValue={visitorTeamTotals.reb}
            homeValue={homeTeamTotals.reb}
          />
          <StatRow
            label="Assists"
            visitorValue={visitorTeamTotals.ast}
            homeValue={homeTeamTotals.ast}
          />
          <StatRow
            label="Turnovers"
            visitorValue={visitorTeamTotals.turnover}
            homeValue={homeTeamTotals.turnover}
          />
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-200"></div>

        {/* Visitor Team Player Stats */}
        {visitorPlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={getTeamLogoUrl(game.visitor_team.abbreviation)}
                alt={game.visitor_team.abbreviation}
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-xl font-bold text-gray-900">
                {game.visitor_team.full_name}
              </h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 overflow-x-auto shadow-sm">
              <PlayerTableHeader />
              {visitorPlayers.map((player, idx) => (
                <PlayerRow key={player.personId || idx} player={player} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-gray-200"></div>

        {/* Home Team Player Stats */}
        {homePlayers.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={getTeamLogoUrl(game.home_team.abbreviation)}
                alt={game.home_team.abbreviation}
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-xl font-bold text-gray-900">
                {game.home_team.full_name}
              </h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 overflow-x-auto shadow-sm">
              <PlayerTableHeader />
              {homePlayers.map((player, idx) => (
                <PlayerRow key={player.personId || idx} player={player} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
