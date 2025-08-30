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
 * PriceCharting history data for a single edition/variant
 */
export interface PriceChartingHistoryData {
    priceChartingId: number;
    name: string;
    lastUpdated: string;
    history: PriceChartingHistoryEntry[];
}

/**
 * PriceCharting API service for searching pricing data
 */
export interface PriceChartingApiService {
    searchPricing(params: PriceChartingSearchParams): Promise<PriceChartingSearchResult[]>;
    getPriceHistory(gameId: string): Promise<PriceChartingHistoryData[]>;
}

export function createPriceChartingApiService(authService: IAuthenticationService): PriceChartingApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const searchEndpoint = '/api/pricecharting/search';
    const historyEndpoint = '/api/pricecharting';

    async function makeAuthenticatedRequest<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const token = await authService.getAccessToken();
            
            const response = await fetch(`${baseUrl}${url}`, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Resource not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
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
        }
    };
}