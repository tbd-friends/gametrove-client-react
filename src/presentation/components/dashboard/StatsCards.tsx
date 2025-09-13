import React from 'react';
import { Gamepad2, Copy, Monitor, Building, AlertCircle } from 'lucide-react';

interface StatsData {
  totalGames: number;
  totalCopies: number;
  platforms: number;
  publishers: number;
}

interface StatsCardsProps {
  stats: StatsData;
  loading: boolean;
  error: string | null;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading, error }) => {
  const statsCards = [
    {
      title: "Total Games",
      value: loading ? "..." : stats.totalGames.toString(),
      icon: <Gamepad2 size={24} className="text-cyan-400" />,
    },
    {
      title: "Total Copies", 
      value: loading ? "..." : stats.totalCopies.toString(),
      icon: <Copy size={24} className="text-green-400" />,
    },
    {
      title: "Platforms",
      value: loading ? "..." : stats.platforms.toString(), 
      icon: <Monitor size={24} className="text-gray-400" />,
    },
    {
      title: "Publishers",
      value: loading ? "..." : stats.publishers.toString(),
      icon: <Building size={24} className="text-yellow-400" />,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat) => (
        <div key={stat.title} className="bg-slate-800 rounded-lg p-6 border border-slate-700 relative">
          {error ? (
            <div className="flex items-center justify-center h-16">
              <div className="text-center">
                <AlertCircle className="text-red-400 mx-auto mb-1" size={16} />
                <p className="text-red-400 text-xs">Failed to load</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-white">
                  {loading ? (
                    <div className="animate-pulse bg-slate-600 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className="absolute top-4 right-4">
                {stat.icon}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Export the type for reuse
export type { StatsData };