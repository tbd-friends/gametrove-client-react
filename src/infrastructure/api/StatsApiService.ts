import type { CollectionStats } from '../../domain/models';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

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

      console.log('📊 Making stats API request to:', `${baseUrl}${url}`);
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
        console.log('📊 Fetching collection stats');
        const stats = await makeAuthenticatedRequest<CollectionStats>(statsEndpoint);
        console.log('✅ Stats received:', stats);
        return stats;
      } catch (error) {
        console.error('❌ Failed to fetch stats:', error);
        throw error;
      }
    }
  };
}