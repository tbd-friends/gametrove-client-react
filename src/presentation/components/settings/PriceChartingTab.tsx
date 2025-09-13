import React from 'react';
import { TrendingUp, Eye, EyeOff, Copy } from 'lucide-react';
import type { UserProfile } from '../../../infrastructure/api/ProfileApiService';

interface PriceChartingTabProps {
  profile: UserProfile | null;
  priceChartingApiKey: string;
  showApiKey: boolean;
  priceChartingSaveLoading: boolean;
  priceChartingSaveError: string | null;
  triggerUpdateLoading: boolean;
  triggerUpdateError: string | null;
  triggerUpdateSuccess: boolean;
  isPriceChartingFormDirty: boolean;
  canSavePriceCharting: boolean;
  onApiKeyChange: (value: string) => void;
  onToggleShowApiKey: () => void;
  onClearApiKey: () => void;
  onCancelChanges: () => void;
  onSaveApiKey: () => void;
  onTriggerUpdate: () => void;
}

export const PriceChartingTab: React.FC<PriceChartingTabProps> = ({
  profile,
  priceChartingApiKey,
  showApiKey,
  priceChartingSaveLoading,
  priceChartingSaveError,
  triggerUpdateLoading,
  triggerUpdateError,
  triggerUpdateSuccess,
  isPriceChartingFormDirty,
  canSavePriceCharting,
  onApiKeyChange,
  onToggleShowApiKey,
  onClearApiKey,
  onCancelChanges,
  onSaveApiKey,
  onTriggerUpdate
}) => {
  return (
    <div className="space-y-8">
      <div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-cyan-400"/>
              <span className="text-white font-medium">PriceCharting API</span>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              profile?.hasPriceChartingApiKey
                ? "bg-green-600 text-green-100"
                : "bg-red-600 text-red-100"
            }`}>
              {profile?.hasPriceChartingApiKey ? "Connected" : "Not Set"}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={priceChartingApiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter your PriceCharting API key"
                disabled={priceChartingSaveLoading}
                className="w-full px-4 py-3 pr-20 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                <button
                  type="button"
                  onClick={onToggleShowApiKey}
                  disabled={priceChartingSaveLoading}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
                {priceChartingApiKey && priceChartingApiKey !== "••••••••••••••••" && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(priceChartingApiKey)}
                    disabled={priceChartingSaveLoading}
                    className="text-gray-400 hover:text-white disabled:opacity-50"
                    title="Copy API key"
                  >
                    <Copy className="w-4 h-4"/>
                  </button>
                )}
              </div>
            </div>
            {priceChartingApiKey && (
              <button
                type="button"
                onClick={onClearApiKey}
                disabled={priceChartingSaveLoading}
                className="text-sm text-red-400 hover:text-red-300 mt-2 disabled:opacity-50"
              >
                Clear API key
              </button>
            )}
            <p className="text-sm text-gray-400 mt-2">
              Your API key is used to fetch current market prices for your games.
            </p>
          </div>
        </div>
      </div>

      {priceChartingSaveError && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-400">❌</span>
            <div>
              <p className="text-red-400 font-medium">Failed to Save API Key</p>
              <p className="text-red-300 text-sm mt-1">{priceChartingSaveError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
        <button 
          onClick={onCancelChanges}
          disabled={!isPriceChartingFormDirty || priceChartingSaveLoading}
          className="px-6 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button 
          onClick={onSaveApiKey}
          disabled={!canSavePriceCharting}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {priceChartingSaveLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          Save Changes
        </button>
      </div>

      {profile?.hasPriceChartingApiKey && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Trigger Pricing Update</h4>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-gray-400 mb-4">
              Manually trigger an update to the current market prices for your games. This will use your
              connected PriceCharting account to fetch the latest prices.
            </p>
            {(triggerUpdateError || triggerUpdateSuccess) && (
              <div className={`p-4 rounded-lg mb-4 ${
                triggerUpdateError
                  ? 'bg-red-900/20 border border-red-500'
                  : 'bg-green-900/20 border border-green-500'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-${triggerUpdateError ? 'red' : 'green'}-400`}>
                    {triggerUpdateError ? '❌' : '✅'}
                  </span>
                  <div>
                    <p className={`text-${triggerUpdateError ? 'red' : 'green'}-400 font-medium`}>
                      {triggerUpdateError ? 'Failed to trigger update' : 'Update triggered successfully'}
                    </p>
                    {triggerUpdateError ? (
                      <p className="text-red-300 text-sm mt-1">{triggerUpdateError}</p>
                    ) : (
                      <p className="text-green-300 text-sm mt-1">
                        The pricing update will be processed in the background. You will be notified
                        when it's complete.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onTriggerUpdate}
              disabled={triggerUpdateLoading}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {triggerUpdateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Triggering Update...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4"/>
                  <span>Trigger Pricing Update</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};