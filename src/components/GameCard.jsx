import { getTeamLogoUrl } from '../utils/teamLogos.jsx';

export const GameCard = ({ game, isSelected = false, onSelect, compact = false }) => {
  // Determine game status
  const getGameStatus = () => {
    if (!game.status) {
      if (game.home_team_score === 0 && game.visitor_team_score === 0) {
        return 'scheduled';
      }
      return 'final';
    }
    return game.status.toLowerCase();
  };

  const status = getGameStatus();
  const isLive = status === 'live';
  const isFinal = status === 'final';
  const isScheduled = status === 'scheduled';

  // Format game time
  const getGameTime = () => {
    if (!game.date) return '';
    const gameDate = new Date(game.date);
    return gameDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge
  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">
          <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-pulse"></span>
          LIVE
        </span>
      );
    }
    if (isFinal) {
      return (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
          FINAL
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
        {getGameTime()}
      </span>
    );
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        isSelected
          ? 'bg-white border-2 border-blue-500 shadow-lg'
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-4">
        {getStatusBadge()}
        {game.period && !isScheduled && (
          <span className="text-xs font-medium text-gray-500">
            {isFinal ? '' : `Q${game.period}`}
          </span>
        )}
      </div>

      {/* Teams and Scores */}
      <div className="space-y-3">
        {/* Visitor Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getTeamLogoUrl(game.visitor_team.abbreviation) ? (
              <img
                src={getTeamLogoUrl(game.visitor_team.abbreviation)}
                alt={game.visitor_team.abbreviation}
                className="w-10 h-10 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ display: getTeamLogoUrl(game.visitor_team.abbreviation) ? 'none' : 'flex' }}
            >
              {game.visitor_team.abbreviation}
            </div>
            <div className="truncate">
              <div className="font-semibold text-gray-900">
                {game.visitor_team.name}
              </div>
              <div className="text-xs text-gray-500">
                {game.visitor_team.abbreviation}
              </div>
            </div>
          </div>
          <div className={`text-2xl font-bold ml-3 ${
            !isScheduled && game.visitor_team_score > game.home_team_score ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {isScheduled ? '-' : game.visitor_team_score}
          </div>
        </div>

        {/* Home Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getTeamLogoUrl(game.home_team.abbreviation) ? (
              <img
                src={getTeamLogoUrl(game.home_team.abbreviation)}
                alt={game.home_team.abbreviation}
                className="w-10 h-10 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ display: getTeamLogoUrl(game.home_team.abbreviation) ? 'none' : 'flex' }}
            >
              {game.home_team.abbreviation}
            </div>
            <div className="truncate">
              <div className="font-semibold text-gray-900">
                {game.home_team.name}
              </div>
              <div className="text-xs text-gray-500">
                {game.home_team.abbreviation}
              </div>
            </div>
          </div>
          <div className={`text-2xl font-bold ml-3 ${
            !isScheduled && game.home_team_score > game.visitor_team_score ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {isScheduled ? '-' : game.home_team_score}
          </div>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600 font-medium text-center">
            Viewing Box Score →
          </div>
        </div>
      )}
    </button>
  );
};
