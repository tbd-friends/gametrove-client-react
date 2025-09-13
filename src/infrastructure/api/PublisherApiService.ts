import type { Publisher } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { logger } from '../../shared/utils/logger';

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
            logger.error('API request failed', error, 'API');
            throw error;
        }
    }

    return {
        async getAllPublishers(): Promise<Publisher[]> {
            try {
                logger.info('Fetching all publishers from API', undefined, 'API');
                const publishers = await makeAuthenticatedRequest<Publisher[]>(publishersEndpoint);
                
                if (Array.isArray(publishers)) {
                    logger.info(`Loaded ${publishers.length} publishers`, undefined, 'API');
                    return publishers;
                }
                
                throw new Error('Invalid response format from publishers API');
            } catch (error) {
                logger.error('Failed to fetch publishers', error, 'API');
                throw error;
            }
        }
    };
}