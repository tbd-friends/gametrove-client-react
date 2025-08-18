import type {Game, PaginatedResponse} from '../../domain/models';
import type {ApiResponse, ListResponse} from '../../domain/models';
import type {IAuthenticationService} from '../../domain/interfaces/IAuthenticationService';

export interface PaginationParams {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedGamesResult {
    games: Game[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

export interface SaveGameRequest {
    name: string;
    platformIdentifier: string;
    igdbGameId?: number;
}

export interface LinkGameToIgdbRequest {
    igdbGameId: number;
}

export interface GameApiService {
    getAllGames(pagination?: PaginationParams): Promise<Game[] | PaginatedGamesResult>;

    getGameById(id: string): Promise<Game | null>;

    searchGames(query: string): Promise<Game[]>;

    checkGameExists(platformId: string, title: string): Promise<boolean>;

    saveGame(request: SaveGameRequest): Promise<Game>;

    linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<Game>;
}

export function createGameApiService(authService: IAuthenticationService): GameApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    console.log('🏠 API Base URL:', baseUrl);
    console.log('🔧 VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);
    const gamesEndpoint = '/api/games';

    async function makeAuthenticatedRequest<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const token = await authService.getAccessToken();
            console.log('🔐 Access token retrieved:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                ...(options.headers as Record<string, string> || {}),
            };

            // Only set Content-Type for requests with a body (POST, PUT, PATCH)
            const method = options.method || 'GET';
            if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.body) {
                headers['Content-Type'] = 'application/json';
            }

            console.log('📡 Making API request to:', `${baseUrl}${url}`);
            console.log('📋 Request headers:', headers);

            const response = await fetch(`${baseUrl}${url}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to access this resource.');
                }
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unexpected error occurred while making the API request.');
        }
    }

    return {
        async getAllGames(pagination?: PaginationParams): Promise<Game[] | PaginatedGamesResult> {
            try {
                let url = gamesEndpoint;

                if (pagination) {
                    const searchParams = new URLSearchParams({
                        page: pagination.page.toString(),
                        limit: pagination.limit.toString()
                    });

                    if (pagination.search && pagination.search.trim()) {
                        searchParams.set('search', pagination.search);
                    }

                    url = `${gamesEndpoint}?${searchParams}`;
                    console.log('🔍 Making paginated request to:', url);
                    console.log('📊 Pagination params:', pagination);
                } else {
                    console.log('🔍 Making non-paginated request to:', url);
                }

                const response = await makeAuthenticatedRequest<PaginatedResponse<Game>>(url);

                // Handle empty results case
                if (response.data && Array.isArray(response.data)) {
                    if (pagination) {
                        // Return paginated result, even if data is empty
                        return {
                            games: response.data,
                            total: response.meta?.total || 0,
                            page: pagination.page,
                            totalPages: response.meta?.totalPages || (response.data.length === 0 ? 0 : 1),
                            hasMore: response.meta?.hasMore || false
                        };
                    }

                    return response.data;
                }

                throw new Error('Invalid response format from games API');
            } catch (error) {
                console.error('Failed to fetch games:', error);
                throw error;
            }
        },

        async getGameById(id: string): Promise<Game | null> {
            try {
                const response = await makeAuthenticatedRequest<ApiResponse<Game>>(`${gamesEndpoint}/${id}`);

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly a game object
                if ('id' in response) {
                    return response as Game;
                }

                return null;
            } catch (error) {
                if (error instanceof Error && error.message.includes('404')) {
                    return null;
                }
                console.error(`Failed to fetch game with ID ${id}:`, error);
                throw error;
            }
        },

        async searchGames(query: string): Promise<Game[]> {
            if (!query.trim()) {
                return [];
            }

            try {
                const searchParams = new URLSearchParams({q: query});
                const response = await makeAuthenticatedRequest<ListResponse<Game>>(
                    `${gamesEndpoint}/search?${searchParams}`
                );

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly an array
                if (Array.isArray(response)) {
                    return response as Game[];
                }

                throw new Error('Invalid response format from games search API');
            } catch (error) {
                console.error(`Failed to search games with query "${query}":`, error);
                throw error;
            }
        },

        async checkGameExists(platformId: string, title: string): Promise<boolean> {
            try {
                const encodedTitle = encodeURIComponent(title);
                const url = `${gamesEndpoint}/${platformId}/${encodedTitle}`;
                
                const response = await fetch(`${baseUrl}${url}`, {
                    method: 'HEAD',
                    headers: {
                        'Authorization': `Bearer ${await authService.getAccessToken()}`,
                    },
                });

                // Return true if game exists (200), false if not found (404)
                return response.status === 200;
            } catch (error) {
                console.error('Error checking if game exists:', error);
                // If there's an error, assume game doesn't exist to allow proceeding
                return false;
            }
        },

        async saveGame(request: SaveGameRequest): Promise<Game> {
            try {
                console.log('💾 Saving game to collection:', request);
                
                const response = await makeAuthenticatedRequest<{ success: boolean; data: Game }>(
                    `${gamesEndpoint}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    }
                );
                
                if ('success' in response && response.success) {
                    console.log('✅ Game saved successfully:', response.data);
                    return response.data;
                }
                
                // Handle direct Game response (fallback)
                if ('id' in response) {
                    console.log('✅ Game saved successfully:', response);
                    return response as Game;
                }
                
                throw new Error('Invalid response format from save game API');
            } catch (error) {
                console.error('❌ Failed to save game:', error);
                throw error;
            }
        },

        async linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<Game> {
            try {
                console.log('🔗 Linking game to IGDB:', gameId, 'with IGDB ID:', request.igdbGameId);
                
                const response = await makeAuthenticatedRequest<{ success: boolean; data: Game }>(
                    `${gamesEndpoint}/${gameId}/link`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    }
                );
                
                if ('success' in response && response.success) {
                    console.log('✅ Game linked to IGDB successfully:', response.data);
                    return response.data;
                }
                
                // Handle direct Game response (fallback)
                if ('id' in response) {
                    console.log('✅ Game linked to IGDB successfully:', response);
                    return response as Game;
                }
                
                throw new Error('Invalid response format from link game API');
            } catch (error) {
                console.error('❌ Failed to link game to IGDB:', error);
                throw error;
            }
        }
    };
}

export interface GameApiServiceConfig {
    baseUrl?: string;
    timeout?: number;
}

export function createGameApiServiceWithConfig(
    authService: IAuthenticationService,
    config: GameApiServiceConfig = {}
): GameApiService {
    const baseUrl = config.baseUrl || import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const timeout = config.timeout || 10000; // 10 seconds default

    async function makeAuthenticatedRequest<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const token = await authService.getAccessToken();

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
                ...(options.headers as Record<string, string> || {}),
            };

            // Only set Content-Type for requests with a body (POST, PUT, PATCH)
            const method = options.method || 'GET';
            if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.body) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${baseUrl}${url}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to access this resource.');
                }
                if (response.status === 404) {
                    throw new Error('Resource not found.');
                }
                if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error(`Request timeout after ${timeout}ms`);
                }
                throw error;
            }
            throw new Error('An unexpected error occurred while making the API request.');
        }
    }

    const gamesEndpoint = '/api/games';

    return {
        async getAllGames(pagination?: PaginationParams): Promise<Game[] | PaginatedGamesResult> {
            try {
                let url = gamesEndpoint;

                if (pagination) {
                    const searchParams = new URLSearchParams({
                        page: pagination.page.toString(),
                        limit: pagination.limit.toString()
                    });

                    if (pagination.search && pagination.search.trim()) {
                        searchParams.set('search', pagination.search);
                    }

                    url = `${gamesEndpoint}?${searchParams}`;
                    console.log('🔍 Making paginated request to:', url);
                    console.log('📊 Pagination params:', pagination);
                } else {
                    console.log('🔍 Making non-paginated request to:', url);
                }

                const response = await makeAuthenticatedRequest<ListResponse<Game>>(url);

                if ('success' in response && response.success) {
                    // Check if this is a paginated response
                    if (pagination) {
                        return {
                            games: response.data || [],
                            total: response.meta?.total || 0,
                            page: pagination.page,
                            totalPages: response.meta?.totalPages || (response.data?.length === 0 ? 0 : 1),
                            hasMore: response.meta?.hasMore || false
                        };
                    }

                    return response.data || [];
                }

                if (Array.isArray(response)) {
                    return response as Game[];
                }

                throw new Error('Invalid response format from games API');
            } catch (error) {
                console.error('Failed to fetch games:', error);
                throw error;
            }
        },

        async getGameById(id: string): Promise<Game | null> {
            try {
                const response = await makeAuthenticatedRequest<ApiResponse<Game>>(`${gamesEndpoint}/${id}`);

                if ('success' in response && response.success) {
                    return response.data;
                }

                if ('id' in response) {
                    return response as Game;
                }

                return null;
            } catch (error) {
                if (error instanceof Error && error.message.includes('Resource not found')) {
                    return null;
                }
                console.error(`Failed to fetch game with ID ${id}:`, error);
                throw error;
            }
        },

        async searchGames(query: string): Promise<Game[]> {
            if (!query.trim()) {
                return [];
            }

            try {
                const searchParams = new URLSearchParams({q: query});
                const response = await makeAuthenticatedRequest<ListResponse<Game>>(
                    `${gamesEndpoint}/search?${searchParams}`
                );

                if ('success' in response && response.success) {
                    return response.data;
                }

                if (Array.isArray(response)) {
                    return response as Game[];
                }

                throw new Error('Invalid response format from games search API');
            } catch (error) {
                console.error(`Failed to search games with query "${query}":`, error);
                throw error;
            }
        },

        async checkGameExists(platformId: string, title: string): Promise<boolean> {
            try {
                const encodedTitle = encodeURIComponent(title);
                const url = `${gamesEndpoint}/${platformId}/${encodedTitle}`;
                
                const response = await fetch(`${baseUrl}${url}`, {
                    method: 'HEAD',
                    headers: {
                        'Authorization': `Bearer ${await authService.getAccessToken()}`,
                    },
                });

                // Return true if game exists (200), false if not found (404)
                return response.status === 200;
            } catch (error) {
                console.error('Error checking if game exists:', error);
                // If there's an error, assume game doesn't exist to allow proceeding
                return false;
            }
        },

        async saveGame(request: SaveGameRequest): Promise<Game> {
            try {
                console.log('💾 Saving game to collection:', request);
                
                const response = await makeAuthenticatedRequest<{ success: boolean; data: Game }>(
                    `${gamesEndpoint}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    }
                );
                
                if ('success' in response && response.success) {
                    console.log('✅ Game saved successfully:', response.data);
                    return response.data;
                }
                
                // Handle direct Game response (fallback)
                if ('id' in response) {
                    console.log('✅ Game saved successfully:', response);
                    return response as Game;
                }
                
                throw new Error('Invalid response format from save game API');
            } catch (error) {
                console.error('❌ Failed to save game:', error);
                throw error;
            }
        },

        async linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<Game> {
            try {
                console.log('🔗 Linking game to IGDB:', gameId, 'with IGDB ID:', request.igdbGameId);
                
                const response = await makeAuthenticatedRequest<{ success: boolean; data: Game }>(
                    `${gamesEndpoint}/${gameId}/link`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    }
                );
                
                if ('success' in response && response.success) {
                    console.log('✅ Game linked to IGDB successfully:', response.data);
                    return response.data;
                }
                
                // Handle direct Game response (fallback)
                if ('id' in response) {
                    console.log('✅ Game linked to IGDB successfully:', response);
                    return response as Game;
                }
                
                throw new Error('Invalid response format from link game API');
            } catch (error) {
                console.error('❌ Failed to link game to IGDB:', error);
                throw error;
            }
        }
    };
}