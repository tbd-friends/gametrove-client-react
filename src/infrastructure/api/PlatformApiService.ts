import type { Platform } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

/**
 * Platform API service for managing platform data
 */
export interface PlatformApiService {
    getAllPlatforms(): Promise<Platform[]>;
}

export function createPlatformApiService(authService: IAuthenticationService): PlatformApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const platformsEndpoint = '/api/platforms';

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
        async getAllPlatforms(): Promise<Platform[]> {
            try {
                console.log('🎮 Fetching all platforms from API');
                const platforms = await makeAuthenticatedRequest<Platform[]>(platformsEndpoint);
                
                if (Array.isArray(platforms)) {
                    console.log(`✅ Loaded ${platforms.length} platforms`);
                    return platforms;
                }
                
                throw new Error('Invalid response format from platforms API');
            } catch (error) {
                console.error('Failed to fetch platforms:', error);
                throw error;
            }
        }
    };
}