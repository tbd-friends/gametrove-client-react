import type {IAuthenticationService} from '../../domain/interfaces/IAuthenticationService';
import { logger } from '../../shared/utils/logger';

/**
 * Condition data structure from API
 */
export interface Condition {
    label: string;
    value: string;
}

/**
 * Condition API service for managing condition data
 */
export interface ConditionApiService {
    getAllConditions(): Promise<Condition[]>;
}

export function createConditionApiService(authService: IAuthenticationService): ConditionApiService {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
    const conditionsEndpoint = '/api/conditions';

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
        async getAllConditions(): Promise<Condition[]> {
            logger.info('Fetching all conditions from API', undefined, 'API');
            const conditions = await makeAuthenticatedRequest<Condition[]>(conditionsEndpoint);

            if (Array.isArray(conditions)) {
                logger.info(`Loaded ${conditions.length} conditions`, undefined, 'API');

                return conditions;
            }

            return [];
        }
    };
}