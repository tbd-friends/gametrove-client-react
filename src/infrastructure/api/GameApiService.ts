import type {Game, PaginatedResponse} from '../../domain/models';
import type {ApiResponse, ListResponse} from '../../domain/models';
import type {IAuthenticationService} from '../../domain/interfaces/IAuthenticationService';
import {environment} from '../../shared/config/environment';
import {ApiError, ErrorCategory} from '../../shared/errors/ApiError';
import {logger} from '../../shared/utils/logger';
import {createAuthenticatedRequestHandler} from '../../shared/utils/apiRequest';

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

export interface UpdateGameRequest {
    name: string;
    platformId: string;
    publisherId: string;
}

export interface CreateCopyRequest {
    purchasedDate: string; // ISO date string
    cost?: number | null;
    upc?: string;
    condition: number; // Bitwise flags sum
    description?: string;
}

export interface AssociatePricingRequest {
    priceChartingId: string;
}

export interface SaveReviewRequest {
    title: string;
    content: string;
    graphicsRating: number;
    soundRating: number;
    gameplayRating: number;
    replayabilityRating: number;
    isCompleted: boolean;
    overallRating: number;
}

export interface GameReview {
    title: string;
    content: string;
    graphicsRating: number;
    soundRating: number;
    gameplayRating: number;
    replayabilityRating: number;
    isCompleted: boolean;
    overallRating: number;
    createdDate?: string;
    updatedDate?: string;
}

export interface SimilarGame {
    identifier: string;
    name: string;
    platform: string;
}

export interface GameApiService {
    getAllGames(pagination?: PaginationParams): Promise<Game[] | PaginatedGamesResult>;

    getGameById(id: string): Promise<Game | null>;

    getRecentGames(): Promise<Game[]>;

    searchGames(query: string): Promise<Game[]>;

    getMoreLikeThis(gameId: string): Promise<SimilarGame[]>;

    checkGameExists(platformId: string, title: string): Promise<boolean>;

    saveGame(request: SaveGameRequest): Promise<string>;

    updateGame(gameId: string, request: UpdateGameRequest): Promise<void>;

    linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<void>;

    createGameCopy(gameId: string, request: CreateCopyRequest): Promise<void>;

    associateCopyPricing(copyId: string, request: AssociatePricingRequest): Promise<void>;

    saveGameReview(gameId: string, request: SaveReviewRequest): Promise<void>;

    getGameReview(gameId: string): Promise<GameReview | null>;
}

export function createGameApiService(authService: IAuthenticationService): GameApiService {
    const baseUrl = environment.apiBaseUrl;
    const gamesEndpoint = '/api/games';

    const makeAuthenticatedRequest = createAuthenticatedRequestHandler(authService);

    // Helper to make requests with full URL
    const makeRequest = <T>(url: string, options?: RequestInit) => 
        makeAuthenticatedRequest<T>(`${baseUrl}${url}`, options);

    return {
        async getAllGames(pagination?: PaginationParams): Promise<Game[] | PaginatedGamesResult> {
            try {
                let url = gamesEndpoint;

                if (pagination) {
                    const searchParams = new URLSearchParams({
                        page: pagination.page.toString(),
                        limit: pagination.limit.toString()
                    });

                    if (pagination.search?.trim()) {
                        searchParams.set('search', pagination.search);
                    }

                    url = `${gamesEndpoint}?${searchParams}`;
                }

                const response = await makeRequest<PaginatedResponse<Game>>(url);

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
                logger.error('Failed to fetch games', error, 'API');
                throw error;
            }
        },

        async getGameById(id: string): Promise<Game | null> {
            try {
                const response = await makeRequest<ApiResponse<Game>>(`${gamesEndpoint}/${id}`);

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
                logger.error(`Failed to fetch game with ID ${id}`, error, 'API');
                throw error;
            }
        },

        async getRecentGames(): Promise<Game[]> {
            try {
                const response = await makeRequest<ListResponse<Game>>(`${gamesEndpoint}/recent`);

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly an array
                if (Array.isArray(response)) {
                    return response as Game[];
                }

                throw new Error('Invalid response format from recent games API');
            } catch (error) {
                logger.error('Failed to fetch recent games', error, 'API');
                throw error;
            }
        },

        async searchGames(query: string): Promise<Game[]> {
            if (!query.trim()) {
                return [];
            }

            try {
                const searchParams = new URLSearchParams({q: query});
                const response = await makeRequest<ListResponse<Game>>(
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
                logger.error(`Failed to search games with query "${query}"`, error, 'API');
                throw error;
            }
        },

        async getMoreLikeThis(gameId: string): Promise<SimilarGame[]> {
            try {
                logger.info(`Fetching similar games for game ID: ${gameId}`, undefined, 'API');
                
                const response = await makeRequest<ListResponse<SimilarGame>>(
                    `${gamesEndpoint}/${gameId}/more-like-this`
                );

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly an array
                if (Array.isArray(response)) {
                    return response as SimilarGame[];
                }

                throw new Error('Invalid response format from more-like-this API');
            } catch (error) {
                if (error instanceof Error && error.message.includes('404')) {
                    logger.info(`No similar games found for game ID: ${gameId}`, undefined, 'API');
                    return [];
                }
                logger.error(`Failed to fetch similar games for game ID ${gameId}`, error, 'API');
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
                logger.error('Error checking if game exists', error, 'API');
                // If there's an error, assume game doesn't exist to allow proceeding
                return false;
            }
        },

        async saveGame(request: SaveGameRequest): Promise<string> {
            try {
                logger.info('Saving game to collection', request, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    const rawGameId = await response.text();
                    const gameId = rawGameId.replace(/"/g, '').trim();
                    logger.info('Game saved successfully', { gameId }, 'API');
                    return gameId;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to add games.');
                }
                if (response.status === 409) {
                    throw new Error('Game already exists in your collection.');
                }

                throw new Error(`Failed to save game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to save game', error, 'API');
                throw error;
            }
        },

        async updateGame(gameId: string, request: UpdateGameRequest): Promise<void> {
            try {
                logger.info('Updating game', { gameId, request }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    logger.info('Game updated successfully', undefined, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to update this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found.');
                }
                if (response.status === 409) {
                    throw new Error('A game with this title already exists on this platform.');
                }

                throw new Error(`Failed to update game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to update game', error, 'API');
                throw error;
            }
        },

        async linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<void> {
            try {
                logger.info('Linking game to IGDB', { gameId, igdbGameId: request.igdbGameId }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}/link`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    const rawLinkedGameId = await response.text();
                    const linkedGameId = rawLinkedGameId.replace(/"/g, '').trim();
                    logger.info('Game linked to IGDB successfully', { linkedGameId }, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to link this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found or IGDB game not found.');
                }

                throw new Error(`Failed to link game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to link game to IGDB', error, 'API');
                throw error;
            }
        },

        async createGameCopy(gameId: string, request: CreateCopyRequest): Promise<void> {
            try {
                logger.info('Creating copy for game', { gameId, request }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}/copies`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    logger.info('Copy created successfully', undefined, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to add copies to this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found.');
                }
                if (response.status === 409) {
                    throw new Error('A copy with these details already exists.');
                }

                throw new Error(`Failed to create copy: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to create game copy', error, 'API');
                throw error;
            }
        },

        async associateCopyPricing(copyId: string, request: AssociatePricingRequest): Promise<void> {
            try {
                logger.info(`Associating pricing for copy ${copyId} with PriceCharting ID`, { priceChartingId: request.priceChartingId }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}/api/copies/${copyId}/associate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(request)
                });

                if (response.ok) {
                    logger.info('Copy pricing associated successfully', undefined, 'API');
                    return;
                }

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to associate pricing for this copy.');
                }
                if (response.status === 404) {
                    throw new Error('Copy or pricing data not found.');
                }
                if (response.status === 409) {
                    throw new Error('This copy is already associated with pricing data.');
                }
                if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }

                throw new Error(`Failed to associate pricing: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to associate copy pricing', error, 'API');
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error('An unexpected error occurred while associating pricing.');
            }
        },

        async saveGameReview(gameId: string, request: SaveReviewRequest): Promise<void> {
            try {
                logger.info(`Saving review for game ID: ${gameId}`, request, 'API');

                await makeRequest<void>(
                    `${gamesEndpoint}/${gameId}/review`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(request),
                    }
                );

                logger.info('Game review saved successfully', undefined, 'API');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timeout. Please try again.');
                    }
                    throw error;
                }
                logger.error('Failed to save game review', error, 'API');
                throw new Error('An unexpected error occurred while saving the review.');
            }
        },

        async getGameReview(gameId: string): Promise<GameReview | null> {
            try {
                logger.info(`Fetching review for game ID: ${gameId}`, undefined, 'API');

                const response = await makeRequest<GameReview>(
                    `${gamesEndpoint}/${gameId}/review`
                );

                logger.info('Game review fetched successfully', undefined, 'API');
                return response;
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message.includes('404')) {
                        logger.info('No review found for this game', undefined, 'API');
                        return null;
                    }
                    if (error.name === 'AbortError') {
                        throw new Error('Request timeout. Please try again.');
                    }
                    throw error;
                }
                logger.error('Failed to fetch game review', error, 'API');
                throw new Error('An unexpected error occurred while fetching the review.');
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
    const baseUrl = config.baseUrl || environment.apiBaseUrl;
    const timeout = config.timeout || 10000; // 10 seconds default

    const makeAuthenticatedRequest = createAuthenticatedRequestHandler(authService, { timeout });

    // Helper to make requests with full URL
    const makeRequest = <T>(url: string, options?: RequestInit) => 
        makeAuthenticatedRequest<T>(`${baseUrl}${url}`, options);

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
                    logger.debug('Making paginated request', { url }, 'API');
                    logger.debug('Pagination params', pagination, 'API');
                } else {
                    logger.debug('Making non-paginated request', { url }, 'API');
                }

                const response = await makeRequest<ListResponse<Game>>(url);

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
                logger.error('Failed to fetch games', error, 'API');
                throw error;
            }
        },

        async getGameById(id: string): Promise<Game | null> {
            try {
                const response = await makeRequest<ApiResponse<Game>>(`${gamesEndpoint}/${id}`);

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
                logger.error(`Failed to fetch game with ID ${id}`, error, 'API');
                throw error;
            }
        },

        async getRecentGames(): Promise<Game[]> {
            try {
                const response = await makeRequest<ListResponse<Game>>(`${gamesEndpoint}/recent`);

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly an array
                if (Array.isArray(response)) {
                    return response as Game[];
                }

                throw new Error('Invalid response format from recent games API');
            } catch (error) {
                logger.error('Failed to fetch recent games', error, 'API');
                throw error;
            }
        },

        async searchGames(query: string): Promise<Game[]> {
            if (!query.trim()) {
                return [];
            }

            try {
                const searchParams = new URLSearchParams({q: query});
                const response = await makeRequest<ListResponse<Game>>(
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
                logger.error(`Failed to search games with query "${query}"`, error, 'API');
                throw error;
            }
        },

        async getMoreLikeThis(gameId: string): Promise<SimilarGame[]> {
            try {
                logger.info(`Fetching similar games for game ID: ${gameId}`, undefined, 'API');
                
                const response = await makeRequest<ListResponse<SimilarGame>>(
                    `${gamesEndpoint}/${gameId}/more-like-this`
                );

                if ('success' in response && response.success) {
                    return response.data;
                }

                // If response is directly an array
                if (Array.isArray(response)) {
                    return response as SimilarGame[];
                }

                throw new Error('Invalid response format from more-like-this API');
            } catch (error) {
                if (error instanceof Error && error.message.includes('Resource not found')) {
                    logger.info(`No similar games found for game ID: ${gameId}`, undefined, 'API');
                    return [];
                }
                logger.error(`Failed to fetch similar games for game ID ${gameId}`, error, 'API');
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
                logger.error('Error checking if game exists', error, 'API');
                // If there's an error, assume game doesn't exist to allow proceeding
                return false;
            }
        },

        async saveGame(request: SaveGameRequest): Promise<string> {
            try {
                logger.info('Saving game to collection', request, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    const rawGameId = await response.text();
                    const gameId = rawGameId.replace(/"/g, '').trim();
                    logger.info('Game saved successfully', { gameId }, 'API');
                    return gameId;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to add games.');
                }
                if (response.status === 409) {
                    throw new Error('Game already exists in your collection.');
                }

                throw new Error(`Failed to save game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to save game', error, 'API');
                throw error;
            }
        },

        async updateGame(gameId: string, request: UpdateGameRequest): Promise<void> {
            try {
                logger.info('Updating game', { gameId, request }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    logger.info('Game updated successfully', undefined, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to update this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found.');
                }
                if (response.status === 409) {
                    throw new Error('A game with this title already exists on this platform.');
                }

                throw new Error(`Failed to update game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to update game', error, 'API');
                throw error;
            }
        },

        async linkGameToIgdb(gameId: string, request: LinkGameToIgdbRequest): Promise<void> {
            try {
                logger.info('Linking game to IGDB', { gameId, igdbGameId: request.igdbGameId }, 'API');

                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}/link`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (response.ok) {
                    const rawLinkedGameId = await response.text();
                    const linkedGameId = rawLinkedGameId.replace(/"/g, '').trim();
                    logger.info('Game linked to IGDB successfully', { linkedGameId }, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to link this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found or IGDB game not found.');
                }

                throw new Error(`Failed to link game: ${response.status} ${response.statusText}`);
            } catch (error) {
                logger.error('Failed to link game to IGDB', error, 'API');
                throw error;
            }
        },

        async createGameCopy(gameId: string, request: CreateCopyRequest): Promise<void> {
            try {
                logger.info('Creating copy for game', { gameId, request }, 'API');

                const token = await authService.getAccessToken();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}/copies`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    logger.info('Copy created successfully', undefined, 'API');
                    return;
                }

                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to add copies to this game.');
                }
                if (response.status === 404) {
                    throw new Error('Game not found.');
                }
                if (response.status === 409) {
                    throw new Error('A copy with these details already exists.');
                }
                if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }

                throw new Error(`Failed to create copy: ${response.status} ${response.statusText}`);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        throw new Error(`Request timeout after ${timeout}ms`);
                    }
                    throw error;
                }
                logger.error('Failed to create game copy', error, 'API');
                throw new Error('An unexpected error occurred while creating the copy.');
            }
        },

        async associateCopyPricing(copyId: string, request: AssociatePricingRequest): Promise<void> {
            try {
                logger.info(`Associating pricing for copy ${copyId} with PriceCharting ID`, { priceChartingId: request.priceChartingId }, 'API');

                const token = await authService.getAccessToken();
                const timeout = 30000;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(`${baseUrl}/api/copies/${copyId}/associate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    logger.info('Copy pricing associated successfully', undefined, 'API');
                    return;
                }

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                if (response.status === 403) {
                    throw new Error('Access forbidden. You do not have permission to associate pricing for this copy.');
                }
                if (response.status === 404) {
                    throw new Error('Copy or pricing data not found.');
                }
                if (response.status === 409) {
                    throw new Error('This copy is already associated with pricing data.');
                }
                if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                }

                throw new Error(`Failed to associate pricing: ${response.status} ${response.statusText}`);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timeout. Please try again.');
                    }
                    throw error;
                }
                logger.error('Failed to associate copy pricing', error, 'API');
                throw new Error('An unexpected error occurred while associating pricing.');
            }
        },

        async saveGameReview(gameId: string, request: SaveReviewRequest): Promise<void> {
            try {
                logger.info(`Saving review for game ID: ${gameId}`, request, 'API');

                const response = await fetch(`${baseUrl}${gamesEndpoint}/${gameId}/review`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await authService.getAccessToken()}`,
                    },
                    body: JSON.stringify(request),
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Authentication failed. Please log in again.');
                    }
                    if (response.status === 403) {
                        throw new Error('Access forbidden. You do not have permission to save reviews.');
                    }
                    throw new Error(`Failed to save review: ${response.status} ${response.statusText}`);
                }

                logger.info('Game review saved successfully', undefined, 'API');
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        throw new Error('Request timeout. Please try again.');
                    }
                    throw error;
                }
                logger.error('Failed to save game review', error, 'API');
                throw new Error('An unexpected error occurred while saving the review.');
            }
        }
    };
}