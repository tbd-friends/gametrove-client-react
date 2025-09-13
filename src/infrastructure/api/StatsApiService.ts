import type { CollectionStats } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { logger } from '../../shared/utils/logger';

export interface StatsApiService {
  getStats(): Promise<CollectionStats>;
}

export function createStatsApiService(authService: IAuthenticationService): StatsApiService {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7054';
  const statsEndpoint = '/api/stats';

  async function makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const token = await authService.getAccessToken();
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        ...(options.headers as Record<string, string> || {}),
      };

      // Only set Content-Type for requests with a body (POST, PUT, PATCH)
      const method = options.method || 'GET';
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && options.body) {
        headers['Content-Type'] = 'application/json';
      }

      logger.debug('Making stats API request', { url: `${baseUrl}${url}`, headers }, 'API');

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
        throw new Error(`Stats API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred while fetching stats.');
    }
  }

  return {
    async getStats(): Promise<CollectionStats> {
      try {
        logger.info('Fetching collection stats', undefined, 'API');
        const stats = await makeAuthenticatedRequest<CollectionStats>(statsEndpoint);
        logger.info('Stats received', stats, 'API');
        return stats;
      } catch (error) {
        logger.error('Failed to fetch stats', error, 'API');
        throw error;
      }
    }
  };
}