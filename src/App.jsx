import { useState } from 'react';
import { DateSelector } from './components/DateSelector';
import { GameCard } from './components/GameCard';
import { LoadingSkeleton } from './components/LoadingSpinner';
import { BoxScore } from './components/BoxScore';
import { useGames } from './hooks/useGames';

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedGame, setSelectedGame] = useState(null);
  const { games, loading, error, lastUpdated, refresh } = useGames(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
        <div className="max-w-full px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">NBA Live Scores</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5">
                <span className="hidden sm:inline">Real-time scores and statistics</span>
                <span className="sm:hidden">Real-time scores</span>
                {lastUpdated && (
                  <span className="ml-2 text-slate-400 hidden md:inline">
                    · Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs sm:text-sm font-medium border border-white/10 hover:border-white/20 flex-shrink-0"
              aria-label="Refresh games"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Date Selector */}
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar - Games List */}
        <aside className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto shadow-sm">
          <div className="p-4 sm:p-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 px-1">
              {games.length > 0 ? `${games.length} ${games.length === 1 ? 'Game' : 'Games'}` : 'Today\'s Games'}
            </h2>

            {/* Loading State */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse"></div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-red-600 font-semibold text-sm mb-2">Error</div>
                <div className="text-red-500 text-xs">{error}</div>
              </div>
            )}

            {/* Games List */}
            {!loading && !error && games.length > 0 && (
              <div className="space-y-3">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={selectedGame?.id === game.id}
                    onSelect={() => setSelectedGame(game)}
                    compact={true}
                  />
                ))}
              </div>
            )}

            {/* No Games State */}
            {!loading && !error && games.length === 0 && (
              <div className="text-center py-16 px-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-gray-900 font-semibold text-lg mb-2">No games scheduled</div>
                <div className="text-gray-500 text-sm">Try selecting a different date</div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area - Box Score */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {selectedGame ? (
            <BoxScore game={selectedGame} onClose={() => setSelectedGame(null)} />
          ) : (
            <div className="flex items-center justify-center h-full p-6 sm:p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Select a game to view stats
                </div>
                <div className="text-sm sm:text-base text-gray-600">
                  Click on any game from the list to see detailed box scores and player statistics
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-full px-6 py-3 text-center text-xs text-gray-500">
          <span>
            Data provided by{' '}
            <a
              href="https://www.nba.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              NBA.com
            </a>
          </span>
          <span className="mx-2">·</span>
          <span>Scores update every 30 seconds for live games</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
