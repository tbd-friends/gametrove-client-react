import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { PriceChartingHighlight } from '../../../infrastructure/api';
import { formatPercentageChange } from '../../utils/priceUtils';

interface PriceHighlightsProps {
  highlights: PriceChartingHighlight[];
  loading: boolean;
  error: string | null;
  onHighlightClick: (gameIdentifier: string) => void;
}

export const PriceHighlights: React.FC<PriceHighlightsProps> = ({
  highlights,
  loading,
  error,
  onHighlightClick
}) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-orange-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Price Highlights</h2>
        <span className="text-gray-400 text-sm">Games with significant price changes</span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          <span className="ml-3 text-gray-400">Loading price highlights...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-red-400 font-medium">Failed to load price highlights</h3>
            <p className="text-gray-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success State - Highlights Grid */}
      {!loading && !error && highlights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highlights.map((highlight) => {
            const changeFormatted = formatPercentageChange(highlight.differencePercentage);
            
            return (
              <div
                key={highlight.gameIdentifier}
                onClick={() => onHighlightClick(highlight.gameIdentifier)}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors text-sm line-clamp-2">
                    {highlight.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Price change:</span>
                  <span className={`text-sm font-bold ${changeFormatted.colorClass}`}>
                    {changeFormatted.displayText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && highlights.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <TrendingUp className="mx-auto mb-3 text-gray-500" size={32} />
          <p className="text-lg mb-2">No Price Highlights</p>
          <p className="text-sm text-gray-500">
            No games have significant price changes at the moment.
          </p>
        </div>
      )}
    </div>
  );
};