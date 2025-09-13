import type { Platform } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { logger } from '../../shared/utils/logger';

/**
 * Platform mapping request structure matching the C# backend Mapping object format
 */
export interface PlatformMappingRequest {
    platforms: Array<{
        platformIdentifier: string; // GUID identifier for platform
        igdbPlatformId: number; // IGDB platform ID
    }>;
}

/**
 * Platform API service for managing platform data
 */
export interface PlatformApiService {
    getAllPlatforms(): Promise<Platform[]>;
    publishPlatformMappings(mappings: PlatformMappingRequest): Promise<void>;
}

export function createPlatformApiService(authService: IAuthenticationService): PlatformApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const platformsEndpoint = '/api/platforms';
    const mappingsEndpoint = '/api/platforms/mapping';

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
            logger.error('API request failed', error, 'API');

            throw error;
        }
    }

    return {
        async getAllPlatforms(): Promise<Platform[]> {
            try {
                logger.info('Fetching all platforms from API', undefined, 'API');
                const platforms = await makeAuthenticatedRequest<Platform[]>(platformsEndpoint);
                
                if (Array.isArray(platforms)) {
                    logger.info(`Loaded ${platforms.length} platforms`, undefined, 'API');
                    return platforms;
                }
                
                throw new Error('Invalid response format from platforms API');
            } catch (error) {
                logger.error('Failed to fetch platforms', error, 'API');
                throw error;
            }
        },

        async publishPlatformMappings(mappings: PlatformMappingRequest): Promise<void> {
            try {
                logger.info('Publishing platform mappings to server', mappings, 'API');
                
                await makeAuthenticatedRequest<void>(mappingsEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mappings),
                });
                
                logger.info('Platform mappings published successfully', undefined, 'API');
            } catch (error) {
                logger.error('Failed to publish platform mappings', error, 'API');
                throw error;
            }
        }
    };
}