import React from 'react';
import { Upload, RotateCcw } from 'lucide-react';
import { IgdbPlatformCombobox } from '../forms';
import type { Platform } from '../../../domain/models/Platform';
import type { IgdbPlatform } from '../../../domain/models/IgdbGame';

interface IgdbTabProps {
  platforms: Platform[];
  igdbPlatforms: IgdbPlatform[];
  platformsLoading: boolean;
  igdbPlatformsLoading: boolean;
  platformMappings: Record<string, IgdbPlatform | null>;
  publishingMappings: boolean;
  onPlatformChange: (platformId: string, igdbPlatform: IgdbPlatform | null) => void;
  onPublishMappings: () => void;
  onReloadPlatforms: () => void;
}

export const IgdbTab: React.FC<IgdbTabProps> = ({
  platforms,
  igdbPlatforms,
  platformsLoading,
  igdbPlatformsLoading,
  platformMappings,
  publishingMappings,
  onPlatformChange,
  onPublishMappings,
  onReloadPlatforms
}) => {
  const sortedPlatforms = [...platforms].sort((a, b) =>
    a.description.localeCompare(b.description)
  );

  const getPlatformIcon = (platform: Platform) => {
    const name = platform.description.toLowerCase();
    const manufacturer = platform.manufacturer.toLowerCase();

    if (manufacturer.includes('sony') || name.includes('playstation')) {
      return {icon: '🎮', color: 'text-blue-400'};
    }
    if (manufacturer.includes('microsoft') || name.includes('xbox')) {
      return {icon: '🎮', color: 'text-green-400'};
    }
    if (manufacturer.includes('nintendo')) {
      return {icon: '🎮', color: 'text-red-400'};
    }
    if (name.includes('pc') || name.includes('steam') || name.includes('windows')) {
      return {icon: '💻', color: 'text-gray-400'};
    }
    return {icon: '🎮', color: 'text-gray-300'};
  };

  const sortedIgdbPlatforms = [...igdbPlatforms].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (platformsLoading || igdbPlatformsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">
          Loading platforms{platformsLoading && igdbPlatformsLoading ? '' : ' and IGDB mappings'}...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Platform Mappings</h3>
          <p className="text-gray-400 mt-2">
            Map your platforms to their corresponding IGDB entries for better game matching.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onPublishMappings}
            disabled={publishingMappings || Object.values(platformMappings).every(v => v === null)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            title="Publish platform mappings to server"
          >
            <Upload className={`w-4 h-4 ${publishingMappings ? 'animate-pulse' : ''}`}/>
            <span>{publishingMappings ? 'Publishing...' : 'Publish Mappings'}</span>
          </button>
          <button
            onClick={onReloadPlatforms}
            disabled={igdbPlatformsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors border border-slate-600"
            title="Reload IGDB platforms (clears cache)"
          >
            <RotateCcw className={`w-4 h-4 ${igdbPlatformsLoading ? 'animate-spin' : ''}`}/>
            <span>Reload Cache</span>
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {sortedPlatforms.map((platform) => {
          const {icon, color} = getPlatformIcon(platform);
          return (
            <div key={platform.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-2xl ${color}`}>
                    {icon}
                  </span>
                  <div>
                    <span className="text-white font-medium">{platform.description}</span>
                    <div className="text-sm text-gray-400">{platform.manufacturer}</div>
                  </div>
                </div>
                <div className="w-64">
                  <IgdbPlatformCombobox
                    value={platformMappings[platform.id] || null}
                    onChange={(igdbPlatform) => onPlatformChange(platform.id, igdbPlatform)}
                    platforms={sortedIgdbPlatforms}
                    placeholder="Search IGDB platforms..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};