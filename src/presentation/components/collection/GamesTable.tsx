import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';
import type { Game } from '../../../domain/models';
import { consoleNameToSlug } from '../../utils/slugUtils';
import { PriceChangeIndicator } from '../common';

interface Console {
  name: string;
}

interface GamesTableProps {
  games: Game[];
  selectedConsole?: Console | null;
  searchValue?: string;
}

export const GamesTable: React.FC<GamesTableProps> = ({
  games,
  selectedConsole,
  searchValue
}) => {
  const navigate = useNavigate();

  if (games.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Title</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Platform</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Publisher</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Copies</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Rating</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Price Trends</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="py-12 text-center">
                <div className="text-gray-400">
                  <Gamepad2 className="mx-auto mb-3 opacity-50" size={48} />
                  <p className="text-lg mb-2">No games found</p>
                  <p className="text-sm">
                    {selectedConsole
                      ? `No games found for ${selectedConsole.name}`
                      : searchValue && searchValue.trim()
                        ? `No games found for "${searchValue}"`
                        : "Your collection is empty"
                    }
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-600">
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Title</th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Platform</th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Publisher</th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Copies</th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Rating</th>
            <th className="text-left text-gray-400 text-sm font-medium pb-3">Price Trends</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr
              key={game.id}
              onClick={() => {
                if (selectedConsole) {
                  const consoleSlug = consoleNameToSlug(selectedConsole.name);
                  navigate(`/collection/console/${consoleSlug}/game/${game.id}`);
                } else {
                  navigate(`/collection/game/${game.id}`);
                }
              }}
              className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer"
            >
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-xl">
                    🎮
                  </div>
                  <div>
                    <div className="text-white font-medium">{game.description}</div>
                    {game.igdbGameId && (
                      <div className="text-xs mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                          IGDB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  game.platform.description.includes('PlayStation') ? 'bg-blue-600 text-white' :
                    game.platform.description.includes('Xbox') ? 'bg-green-600 text-white' :
                      game.platform.description.includes('Nintendo') ? 'bg-red-600 text-white' :
                        'bg-purple-600 text-white'
                }`}>
                  {game.platform.description}
                </span>
              </td>
              <td className="py-3 text-gray-300">{game.publisher?.description}</td>
              <td className="py-3">
                <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {game.copyCount}
                </span>
              </td>
              <td className="py-3 text-gray-300">
                {game.overallRating !== null && game.overallRating !== undefined ? (
                  <span className={`text-3xl font-bold ${
                    game.overallRating < 35 ? 'text-red-400' :
                    game.overallRating < 55 ? 'text-yellow-400' :
                    game.overallRating < 75 ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {game.overallRating}
                  </span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="py-3">
                {game.averages ? (
                  <PriceChangeIndicator averages={game.averages} />
                ) : (
                  <span className="text-gray-500 text-sm">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};