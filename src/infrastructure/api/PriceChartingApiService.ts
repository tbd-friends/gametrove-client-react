import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

/**
 * PriceCharting search result structure from API
 */
export interface PriceChartingSearchResult {
    name: string;
    priceChartingId: string;
    consoleName: string;
    completeInBoxPrice: number;
    loosePrice: number;
    newPrice: number;
}

/**
 * PriceCharting search request parameters
 */
export interface PriceChartingSearchParams {
    upc?: string;
    name?: string;
}

/**
 * PriceCharting history entry structure
 */
export interface PriceChartingHistoryEntry {
    completeInBox: number;
    loose: number;
    new: number;
    captured: string;
}

/**
 * PriceCharting statistics for price changes
 */
export interface PriceChartingStatistics {
    completeInBoxPercentageChange: number;
    completeInBoxPercentageChange12Months: number;
    loosePercentageChange: number;
    loosePercentageChange12Months: number;
    newPercentageChange: number;
    newPercentageChange12Months: number;
}

/**
 * PriceCharting highlight entry for games with significant price changes
 */
export interface PriceChartingHighlight {
    gameIdentifier: string;
    name: string;
    differencePercentage: number;
}

/**
 * PriceCharting history data for a single edition/variant
 */
export interface PriceChartingHistoryData {
    priceChartingId: number;
    name: string;
    lastUpdated: string;
    completeInBox: number;
    loose: number;
    new: number;
    statistics: PriceChartingStatistics;
    history: PriceChartingHistoryEntry[];
}

/**
 * PriceCharting API service for searching pricing data
 */
export interface PriceChartingApiService {
    searchPricing(params: PriceChartingSearchParams): Promise<PriceChartingSearchResult[]>;
    getPriceHistory(gameId: string): Promise<PriceChartingHistoryData[]>;
    getHighlights(): Promise<PriceChartingHighlight[]>;
    triggerPricingUpdate(): Promise<void>;
}

export function createPriceChartingApiService(authService: IAuthenticationService): PriceChartingApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const searchEndpoint = '/api/pricecharting/search';
    const historyEndpoint = '/api/pricecharting';
    const highlightsEndpoint = '/api/pricecharting/highlights';
    const defaultTimeout = 30000; // 30 seconds for regular requests
    const pricingUpdateTimeout = 120000; // 2 minutes for pricing updates

    async function makeAuthenticatedRequest<T>(
        url: string,
        options: RequestInit = {},
        timeoutMs: number = defaultTimeout
    ): Promise<T> {
        try {
            const token = await authService.getAccessToken();
            
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(`${baseUrl}${url}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Resource not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
            }
            console.error('API request failed:', error);
            throw error;
        }
    }

    return {
        async searchPricing(params: PriceChartingSearchParams): Promise<PriceChartingSearchResult[]> {
            try {
                console.log('🔍 Searching PriceCharting with params:', params);
                
                // Build query string
                const searchParams = new URLSearchParams();
                if (params.upc) searchParams.append('upc', params.upc);
                if (params.name) searchParams.append('name', params.name);
                
                const url = `${searchEndpoint}?${searchParams.toString()}`;
                const results = await makeAuthenticatedRequest<PriceChartingSearchResult[]>(url);
                
                if (Array.isArray(results)) {
                    console.log(`✅ Found ${results.length} PriceCharting matches`);
                    return results;
                }
                
                throw new Error('Invalid response format from PriceCharting search API');
            } catch (error) {
                console.error('Failed to search PriceCharting:', error);
                throw error;
            }
        },

        async getPriceHistory(gameId: string): Promise<PriceChartingHistoryData[]> {
            try {
                console.log(`📊 Fetching PriceCharting history for game ID: ${gameId}`);
                
                const url = `${historyEndpoint}/${gameId}/history`;
                const results = await makeAuthenticatedRequest<PriceChartingHistoryData[]>(url);
                
                if (Array.isArray(results)) {
                    console.log(`✅ Found pricing history for ${results.length} edition(s)`);
                    return results;
                }
                
                throw new Error('Invalid response format from PriceCharting history API');
            } catch (error) {
                console.error('Failed to fetch PriceCharting history:', error);
                throw error;
            }
        },

        async getHighlights(): Promise<PriceChartingHighlight[]> {
            try {
                console.log('📈 Fetching PriceCharting highlights');
                
                const results = await makeAuthenticatedRequest<PriceChartingHighlight[]>(highlightsEndpoint);
                
                if (Array.isArray(results)) {
                    console.log(`✅ Found ${results.length} pricing highlights`);
                    return results;
                }
                
                throw new Error('Invalid response format from PriceCharting highlights API');
            } catch (error) {
                console.error('Failed to fetch PriceCharting highlights:', error);
                throw error;
            }
        },

        async triggerPricingUpdate(): Promise<void> {
            try {
                console.log(`🔄 Triggering pricing update`);

                const token = await authService.getAccessToken();
                
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), pricingUpdateTimeout);

                const response = await fetch(`${baseUrl}/api/pricecharting/update`, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Resource not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                console.log(`✅ Pricing update triggered successfully`);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error(`Request timed out after ${pricingUpdateTimeout / 1000} seconds`);
                }
                console.error('Failed to trigger pricing update:', error);
                throw error;
            }
        }
    };
}