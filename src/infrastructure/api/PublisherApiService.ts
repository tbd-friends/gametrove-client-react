import type { Publisher } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

/**
 * Publisher API service for managing publisher data
 */
export interface PublisherApiService {
    getAllPublishers(): Promise<Publisher[]>;
}

export function createPublisherApiService(authService: IAuthenticationService): PublisherApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const publishersEndpoint = '/api/publishers';

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
        async getAllPublishers(): Promise<Publisher[]> {
            try {
                console.log('🏢 Fetching all publishers from API');
                const publishers = await makeAuthenticatedRequest<Publisher[]>(publishersEndpoint);
                
                if (Array.isArray(publishers)) {
                    console.log(`✅ Loaded ${publishers.length} publishers`);
                    return publishers;
                }
                
                throw new Error('Invalid response format from publishers API');
            } catch (error) {
                console.error('Failed to fetch publishers:', error);
                throw error;
            }
        }
    };
}