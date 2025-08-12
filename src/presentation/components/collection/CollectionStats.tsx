import React from 'react';
import { Gamepad2, Copy, Monitor, Heart } from 'lucide-react';
import type { Game } from '../../../domain/models';

interface CollectionStatsProps {
  games: Game[];
  loading: boolean;
  paginationEnabled: boolean;
  totalGames: number;
}

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  games,
  loading,
  paginationEnabled,
  totalGames
}) => {
  const totalCopies = games.reduce((total, game) => total + game.copyCount.length, 0);
  const uniquePlatforms = new Set(games.map(game => game.platform.description)).size;

  const statsCards = [
    {
      title: "Total Games",
      value: loading ? "..." : (paginationEnabled ? totalGames : games.length).toString(),
      icon: <Gamepad2 size={24} className="text-cyan-400" />,
    },
    {
      title: "Total Copies",
      value: loading ? "..." : totalCopies.toString(),
      icon: <Copy size={24} className="text-green-400" />,
    },
    {
      title: "Consoles",
      value: loading ? "..." : uniquePlatforms.toString(),
      icon: <Monitor size={24} className="text-gray-400" />,
    },
    {
      title: "Wishlist",
      value: "0", // TODO: Implement wishlist functionality
      icon: <Heart size={24} className="text-red-400" />,
    }
  ];

  return (
    <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat) => (
        <div key={stat.title} className="bg-slate-800 rounded-lg p-6 border border-slate-700 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className="absolute top-4 right-4">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};