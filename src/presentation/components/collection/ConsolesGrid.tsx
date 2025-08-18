import React from 'react';
import { ChevronRight, Monitor } from 'lucide-react';
import type { Game } from '../../../domain/models';

interface Console {
  name: string;
  company: string;
  gameCount: number;
  color: string;
  icon: string;
}

interface ConsolesGridProps {
  games: Game[];
  onConsoleClick: (console: Console) => void;
}

export const ConsolesGrid: React.FC<ConsolesGridProps> = ({
  games,
  onConsoleClick
}) => {
  const platformColorMap: Record<string, string> = {
    'PlayStation': 'bg-blue-600',
    'Xbox': 'bg-green-600',
    'Nintendo': 'bg-red-600',
    'PC': 'bg-purple-600',
    'Steam': 'bg-orange-600'
  };

  const getPlatformColor = (platformName: string): string => {
    for (const [key, color] of Object.entries(platformColorMap)) {
      if (platformName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-gray-600'; // default color
  };

  const consoles = React.useMemo(() => {
    const platformGroups = games.reduce((acc, game) => {
      const platformName = game.platform.description;
      if (!acc[platformName]) {
        acc[platformName] = {
          name: platformName,
          company: "Various Publishers", // TODO: Add company info to platform model
          gameCount: 0,
          color: getPlatformColor(platformName),
          icon: platformName.toLowerCase().includes('pc') || platformName.toLowerCase().includes('steam') ? "💻" : "🎮"
        };
      }
      acc[platformName].gameCount += 1;
      return acc;
    }, {} as Record<string, Console>);

    return Object.values(platformGroups).sort((a, b) => b.gameCount - a.gameCount);
  }, [games]);

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">
          <Monitor className="mx-auto mb-3 opacity-50" size={48} />
          <p className="text-lg mb-2">No consoles in your collection</p>
          <p className="text-sm">Add some games to see your console breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {consoles.map((console) => (
        <div
          key={console.name}
          onClick={() => onConsoleClick(console)}
          className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${console.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                {console.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold">{console.name}</h3>
                <p className="text-gray-400 text-sm">{console.company}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-green-400">{console.gameCount}</div>
            <div className="text-gray-400 text-sm">Games</div>
          </div>
        </div>
      ))}
    </div>
  );
};