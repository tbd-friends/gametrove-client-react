import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

/**
 * User profile data structure from API
 */
export interface UserProfile {
    name: string;
    favoriteGame: string;
    hasPriceChartingApiKey: boolean;
}

/**
 * Request structure for updating PriceCharting API key
 */
export interface UpdatePriceChartingApiKeyRequest {
    priceChartingApiKey: string | null;
}

/**
 * Profile API service for managing user profile data
 */
export interface ProfileApiService {
    getUserProfile(): Promise<UserProfile | null>;
    updateUserProfile(profile: UserProfile): Promise<void>;
    updatePriceChartingApiKey(request: UpdatePriceChartingApiKeyRequest): Promise<void>;
}

export function createProfileApiService(authService: IAuthenticationService): ProfileApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const profileEndpoint = '/api/profile';

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
        async getUserProfile(): Promise<UserProfile | null> {
            try {
                console.log('👤 Fetching user profile from API');
                const profile = await makeAuthenticatedRequest<UserProfile>(profileEndpoint);
                console.log('✅ User profile loaded successfully');
                return profile;
            } catch (error) {
                if (error instanceof Error && error.message.includes('Resource not found')) {
                    console.log('ℹ️ User profile not found (404) - this is acceptable');
                    return null;
                }
                console.error('Failed to fetch user profile:', error);
                throw error;
            }
        },

        async updateUserProfile(profile: UserProfile): Promise<void> {
            try {
                console.log('💾 Updating user profile:', profile);
                
                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${profileEndpoint}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profile),
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Resource not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Don't try to parse JSON from 200 OK response
                console.log('✅ User profile updated successfully');
            } catch (error) {
                console.error('❌ Failed to update user profile:', error);
                throw error;
            }
        },

        async updatePriceChartingApiKey(request: UpdatePriceChartingApiKeyRequest): Promise<void> {
            try {
                console.log('💾 Updating PriceCharting API key');
                
                const token = await authService.getAccessToken();
                const response = await fetch(`${baseUrl}${profileEndpoint}/pricecharting`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(request),
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Resource not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Don't try to parse JSON from 200 OK response
                console.log('✅ PriceCharting API key updated successfully');
            } catch (error) {
                console.error('❌ Failed to update PriceCharting API key:', error);
                throw error;
            }
        }
    };
}