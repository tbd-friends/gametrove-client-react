import React, { useState, useEffect } from 'react';
import { X, Search, DollarSign, Check } from 'lucide-react';
import { createPriceChartingApiService } from '../../../infrastructure/api/PriceChartingApiService';
import type { PriceChartingSearchResult, PriceChartingSearchParams } from '../../../infrastructure/api/PriceChartingApiService';
import { createGameApiService } from '../../../infrastructure/api/GameApiService';
import type { AssociatePricingRequest } from '../../../infrastructure/api/GameApiService';
import { useAuthService } from '../../hooks/useAuthService';
import type { GameCopy } from '../../../domain/models/GameCopy';

interface PriceChartingSearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    copy: GameCopy;
    gameName: string;
    onSuccess?: () => void; // Callback when pricing is successfully associated
}

export const PriceChartingSearchDialog: React.FC<PriceChartingSearchDialogProps> = ({
    isOpen,
    onClose,
    copy,
    gameName,
    onSuccess
}) => {
    const [results, setResults] = useState<PriceChartingSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [associatingId, setAssociatingId] = useState<string | null>(null);
    const [associationError, setAssociationError] = useState<string | null>(null);
    const authService = useAuthService();

    useEffect(() => {
        if (isOpen) {
            searchPricing();
        } else {
            // Reset state when dialog closes
            setResults([]);
            setError(null);
            setAssociationError(null);
            setAssociatingId(null);
        }
    }, [isOpen]);

    const searchPricing = async () => {
        try {
            setLoading(true);
            setError(null);

            const priceChartingService = createPriceChartingApiService(authService);
            const params: PriceChartingSearchParams = {
                name: gameName
            };

            // Add UPC if available
            if (copy.upc) {
                params.upc = copy.upc;
            }

            const searchResults = await priceChartingService.searchPricing(params);
            setResults(searchResults);
        } catch (err) {
            console.error('Failed to search PriceCharting:', err);
            setError(err instanceof Error ? err.message : 'Failed to search for pricing');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPricing = async (result: PriceChartingSearchResult) => {
        if (!copy) return;

        try {
            setAssociatingId(result.priceChartingId);
            setAssociationError(null);

            const gameApiService = createGameApiService(authService);
            const request: AssociatePricingRequest = {
                priceChartingId: result.priceChartingId
            };

            await gameApiService.associateCopyPricing(copy.id, request);
            
            // Success! Close dialog and refresh data
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Failed to associate pricing:', err);
            setAssociationError(err instanceof Error ? err.message : 'Failed to associate pricing');
        } finally {
            setAssociatingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-5xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                        <Search className="w-6 h-6 text-cyan-400" />
                        <div>
                            <h2 className="text-xl font-semibold text-white">Search PriceCharting</h2>
                            <p className="text-gray-400 text-sm">Find pricing data for "{gameName}"</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Association Error */}
                    {associationError && (
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-red-400">❌</span>
                                <div>
                                    <p className="text-red-400 font-medium">Failed to Link Pricing</p>
                                    <p className="text-red-300 text-sm mt-1">{associationError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            <span className="ml-3 text-gray-400">Searching for pricing...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-red-400">❌</span>
                                <div>
                                    <p className="text-red-400 font-medium">Search Failed</p>
                                    <p className="text-red-300 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">No matches found</p>
                            <p className="text-gray-500 text-sm mt-2">
                                Try adjusting the search terms or check if the game is available on PriceCharting.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-400 text-sm mb-6">
                                Found {results.length} match{results.length !== 1 ? 'es' : ''}:
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {results.map((result, index) => (
                                    <div
                                        key={`${result.priceChartingId}-${index}`}
                                        className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-white font-medium mb-1">{result.name}</h3>
                                                <p className="text-cyan-400 text-sm font-medium mb-1">{result.consoleName}</p>
                                                <p className="text-gray-400 text-xs">
                                                    ID: {result.priceChartingId}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleSelectPricing(result)}
                                                disabled={associatingId === result.priceChartingId}
                                                className="ml-4 flex items-center gap-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                            >
                                                {associatingId === result.priceChartingId ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                                                        Linking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Select
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center bg-slate-700 rounded-lg p-3">
                                                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Loose</p>
                                                <p className="text-green-400 font-semibold text-lg">
                                                    ${result.loosePrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-center bg-slate-700 rounded-lg p-3">
                                                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Complete</p>
                                                <p className="text-green-400 font-semibold text-lg">
                                                    ${result.completeInBoxPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-center bg-slate-700 rounded-lg p-3">
                                                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">New</p>
                                                <p className="text-green-400 font-semibold text-lg">
                                                    ${result.newPrice.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={searchPricing}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Search Again
                    </button>
                </div>
            </div>
        </div>
    );
};