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
 * PriceCharting API service for searching pricing data
 */
export interface PriceChartingApiService {
    searchPricing(params: PriceChartingSearchParams): Promise<PriceChartingSearchResult[]>;
}

export function createPriceChartingApiService(authService: IAuthenticationService): PriceChartingApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const searchEndpoint = '/api/pricecharting/search';

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
        }
    };
}