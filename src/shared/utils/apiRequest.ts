/**
 * Shared Authenticated Request Utility
 * Provides common functionality for API requests with authentication
 */

import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { logger } from './logger';
import { ApiError } from '../errors/ApiError';

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Creates an authenticated request function with consistent error handling
 */
export function createAuthenticatedRequestHandler(
  authService: IAuthenticationService,
  config: ApiRequestConfig = {}
) {
  const { timeout = 10000, retries = 0, retryDelay = 1000 } = config;

  return async function makeAuthenticatedRequest<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const method = options.method || 'GET';
    const context = { endpoint: url, method };
    
    try {
      logger.apiCall(url, method, options.body);
      
      const token = await authService.getAccessToken();

      const controller = new AbortController();
      const requestTimeout = options.timeout || timeout;
      const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        ...(options.headers as Record<string, string> || {}),
      };

      // Only set Content-Type for requests with a body
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const requestOptions: RequestInit = {
        ...options,
        headers,
        signal: controller.signal,
      };

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      logger.apiResponse(url, response.status);

      if (!response.ok) {
        throw ApiError.fromHttpResponse(response, context);
      }

      // Handle empty responses (204, etc.)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw ApiError.network('Request timed out', context);
      }

      // Handle network errors
      if (error instanceof Error && error.message.includes('fetch')) {
        throw ApiError.network('Network request failed', context);
      }

      // Generic error handling
      throw ApiError.fromError(error as Error, context);
    }
  };
}

/**
 * Utility function for simple authenticated requests without configuration
 */
export function createSimpleAuthenticatedRequest(authService: IAuthenticationService) {
  return createAuthenticatedRequestHandler(authService);
}