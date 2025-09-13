import React from 'react';
import { Gamepad2, AlertCircle } from 'lucide-react';
import type { Game } from '../../../domain/models';
import { PriceChangeIndicator } from '../common';

interface RecentGamesProps {
  recentGames: Game[];
  loading: boolean;
  error: string | null;
  onGameClick: (gameId: string) => void;
}

export const RecentGames: React.FC<RecentGamesProps> = ({
  recentGames,
  loading,
  error,
  onGameClick
}) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white">Recent Games</h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-400">Loading recent games...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-red-400 font-medium">Failed to load recent games</h3>
              <p className="text-gray-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State - Games Cards */}
      {!loading && !error && recentGames.length > 0 && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentGames.map((game) => (
              <div
                key={game.id}
                onClick={() => onGameClick(game.id)}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer group border border-slate-600"
              >
                {/* Game Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    🎮
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors text-base leading-tight mb-2 line-clamp-2">
                      {game.description}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        game.platform.description.includes('PlayStation') ? 'bg-blue-600 text-white' :
                        game.platform.description.includes('Xbox') ? 'bg-green-600 text-white' :
                        game.platform.description.includes('Nintendo') ? 'bg-red-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {game.platform.description}
                      </span>
                      {game.igdbGameId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                          IGDB
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Copies</div>
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {game.copyCount}
                      </span>
                    </div>
                    {game.overallRating !== null && game.overallRating !== undefined && (
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Rating</div>
                        <span className={`text-lg font-bold ${
                          game.overallRating < 35 ? 'text-red-400' :
                          game.overallRating < 55 ? 'text-yellow-400' :
                          game.overallRating < 75 ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          {game.overallRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Trends */}
                {game.averages && (
                  <div className="border-t border-slate-600 pt-3">
                    <div className="text-xs text-gray-400 mb-2">Price Trends</div>
                    <PriceChangeIndicator averages={game.averages} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && recentGames.length === 0 && (
        <div className="p-6">
          <div className="text-center text-gray-400 py-8">
            <Gamepad2 className="mx-auto mb-3 text-gray-500" size={32} />
            <p className="text-lg mb-2">No Recent Games</p>
            <p className="text-sm text-gray-500">
              Start building your collection to see recent games here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};