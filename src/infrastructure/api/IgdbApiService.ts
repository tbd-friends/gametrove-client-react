import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import type { IgdbPlatform } from '../../domain/models/IgdbGame';

/**
 * IGDB search result interface matching the API response
 */
export interface IgdbGameResult {
    id: number;
    name: string;
    summary?: string;
    platforms?: Array<{
        name: string;
    }>;
    genres?: Array<{
        name: string;
    }>;
    themes?: Array<{
        name: string;
    }>;
}

/**
 * Enhanced IGDB game details interface for detailed game information
 */
export interface IgdbGameDetails {
    id: number;
    name: string;
    summary?: string;
    platforms?: Array<{
        name: string;
    }>;
    genres?: Array<{
        name: string;
    }>;
    themes?: Array<{
        name: string;
    }>;
    screenshots?: Array<{
        imageId: string;
        url: string;
        height: number;
        width: number;
    }>;
}

/**
 * IGDB API service for game search and platform functionality
 */
export interface IgdbApiService {
    searchGames(term: string, platformId: number): Promise<IgdbGameResult[]>;
    getPlatforms(): Promise<IgdbPlatform[]>;
    clearPlatformsCache(): void;
    getGameDetails(igdbGameId: number): Promise<IgdbGameDetails>;
}

/**
 * Client-side cache for IGDB platforms
 */
interface PlatformCache {
    data: IgdbPlatform[] | null;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

// Cache instance (shared across service instances)
let platformCache: PlatformCache = {
    data: null,
    timestamp: 0,
    ttl: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

export function createIgdbApiService(authService: IAuthenticationService): IgdbApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const searchEndpoint = '/api/igdb/search';
    const platformsEndpoint = '/api/igdb/platforms';

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
                    throw new Error('IGDB search endpoint not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('IGDB API request failed:', error);
            throw error;
        }
    }

    /**
     * Check if cache is valid and not expired
     */
    function isCacheValid(): boolean {
        if (!platformCache.data) return false;
        const now = Date.now();
        return (now - platformCache.timestamp) < platformCache.ttl;
    }

    return {
        async searchGames(term: string, platformId: number): Promise<IgdbGameResult[]> {
            try {
                console.log('🎮 Searching IGDB for games:', { term, platformId });
                
                const searchParams = new URLSearchParams({
                    term: term.trim(),
                    platformId: platformId.toString()
                });
                
                const games = await makeAuthenticatedRequest<IgdbGameResult[]>(
                    `${searchEndpoint}?${searchParams.toString()}`
                );
                
                if (Array.isArray(games)) {
                    console.log(`✅ Found ${games.length} games from IGDB`);
                    return games;
                }
                
                throw new Error('Invalid response format from IGDB search API');
            } catch (error) {
                console.error('Failed to search IGDB:', error);
                throw error;
            }
        },

        async getPlatforms(): Promise<IgdbPlatform[]> {
            try {
                // Check cache first
                if (isCacheValid()) {
                    console.log('🎮 Using cached IGDB platforms');
                    return platformCache.data!;
                }

                console.log('🎮 Fetching IGDB platforms from API');
                const platforms = await makeAuthenticatedRequest<IgdbPlatform[]>(platformsEndpoint);
                
                if (Array.isArray(platforms)) {
                    // Update cache
                    platformCache = {
                        data: platforms,
                        timestamp: Date.now(),
                        ttl: platformCache.ttl
                    };
                    
                    console.log(`✅ Loaded ${platforms.length} IGDB platforms and cached`);
                    return platforms;
                }
                
                throw new Error('Invalid response format from IGDB platforms API');
            } catch (error) {
                console.error('Failed to fetch IGDB platforms:', error);
                throw error;
            }
        },

        clearPlatformsCache(): void {
            console.log('🗑️ Clearing IGDB platforms cache');
            platformCache = {
                data: null,
                timestamp: 0,
                ttl: platformCache.ttl
            };
        },

        async getGameDetails(igdbGameId: number): Promise<IgdbGameDetails> {
            try {
                console.log('🎮 Fetching IGDB game details for ID:', igdbGameId);
                
                const gameDetails = await makeAuthenticatedRequest<IgdbGameDetails>(
                    `/api/igdb/games/${igdbGameId}`
                );
                
                console.log('✅ Loaded IGDB game details:', gameDetails);
                return gameDetails;
            } catch (error) {
                console.error('Failed to fetch IGDB game details:', error);
                throw error;
            }
        }
    };
}