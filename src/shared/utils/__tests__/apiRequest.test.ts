/**
 * Tests for the shared authenticated request utility
 * Critical for ensuring reliable API communication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAuthenticatedRequestHandler } from '../apiRequest'
import type { IAuthenticationService } from '../../../domain/interfaces/IAuthenticationService'
import { ApiError } from '../../errors/ApiError'

describe('createAuthenticatedRequestHandler', () => {
  let mockAuthService: IAuthenticationService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: true,
      isLoading: false,
      getAccessToken: vi.fn().mockResolvedValue('mock-token'),
      login: vi.fn(),
      logout: vi.fn()
    }

    mockFetch = vi.fn()
    global.fetch = mockFetch

    // Clear all timers
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('Successful Requests', () => {
    it('should make authenticated requests with bearer token', async () => {
      const mockResponse = { success: true, data: { id: '1', name: 'Test Game' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      const result = await makeRequest('/api/games')

      expect(mockAuthService.getAccessToken).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith('/api/games', {
        headers: {
          'Authorization': 'Bearer mock-token'
        },
        signal: expect.any(AbortSignal)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include Content-Type for POST requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({ success: true })
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      await makeRequest('/api/games', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Game' })
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/games', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Game' }),
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        },
        signal: expect.any(AbortSignal)
      })
    })

    it('should merge additional headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      await makeRequest('/api/games', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Accept': 'application/json'
        }
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/games', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'X-Custom-Header': 'custom-value',
          'Accept': 'application/json'
        },
        signal: expect.any(AbortSignal)
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw ApiError for HTTP 401 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        url: '/api/games'
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      await expect(makeRequest('/api/games')).rejects.toThrow(ApiError)
      
      try {
        await makeRequest('/api/games')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(401)
        expect((error as ApiError).userMessage).toBe('Please log in to continue')
      }
    })

    it('should throw ApiError for HTTP 403 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        url: '/api/games'
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      try {
        await makeRequest('/api/games')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(403)
        expect((error as ApiError).userMessage).toBe('You do not have permission to perform this action')
      }
    })

    it('should throw ApiError for HTTP 404 responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: '/api/games/nonexistent'
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      try {
        await makeRequest('/api/games/nonexistent')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(404)
        expect((error as ApiError).userMessage).toBe('The requested resource was not found')
      }
    })

    it('should throw ApiError for HTTP 500 responses with retry flag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        url: '/api/games'
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      try {
        await makeRequest('/api/games')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(500)
        expect((error as ApiError).isRetryable).toBe(true)
        expect((error as ApiError).userMessage).toBe('A server error occurred. Please try again later')
      }
    })

    it('should handle network failures', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      try {
        await makeRequest('/api/games')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).userMessage).toBe('Network request failed')
      }
    })

    it('should handle authentication service failures', async () => {
      mockAuthService.getAccessToken = vi.fn().mockRejectedValue(new Error('Auth service unavailable'))

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      await expect(makeRequest('/api/games')).rejects.toThrow('Auth service unavailable')
    })
  })

  describe('Timeout Handling', () => {
    it('should timeout requests after default 10 seconds', async () => {
      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      // Mock a request that never resolves
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      const requestPromise = makeRequest('/api/games')
      
      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(10000)
      
      await expect(requestPromise).rejects.toThrow(ApiError)
      
      try {
        await requestPromise
      } catch (error) {
        expect((error as ApiError).userMessage).toBe('Request timed out')
      }
    })

    it('should respect custom timeout configuration', async () => {
      const makeRequest = createAuthenticatedRequestHandler(mockAuthService, { timeout: 5000 })
      
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      const requestPromise = makeRequest('/api/games')
      
      // Should not timeout after 4 seconds
      vi.advanceTimersByTime(4000)
      // Should timeout after 5 seconds
      vi.advanceTimersByTime(1000)
      
      await expect(requestPromise).rejects.toThrow(ApiError)
    })

    it('should respect per-request timeout option', async () => {
      const makeRequest = createAuthenticatedRequestHandler(mockAuthService, { timeout: 10000 })
      
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      const requestPromise = makeRequest('/api/games', { timeout: 2000 })
      
      // Should timeout after 2 seconds (per-request timeout)
      vi.advanceTimersByTime(2000)
      
      await expect(requestPromise).rejects.toThrow(ApiError)
    })
  })

  describe('Response Processing', () => {
    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map([['content-type', 'text/plain']]),
        json: () => Promise.reject(new Error('No JSON'))
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      const result = await makeRequest('/api/games/delete')

      expect(result).toEqual({})
    })

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/plain']]),
        json: () => Promise.reject(new Error('Not JSON'))
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      const result = await makeRequest('/api/status')

      expect(result).toEqual({})
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      await expect(makeRequest('/api/games')).rejects.toThrow()
    })
  })

  describe('Request Context', () => {
    it('should include request context in error information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        url: '/api/games'
      })

      const makeRequest = createAuthenticatedRequestHandler(mockAuthService)
      
      try {
        await makeRequest('/api/games', { method: 'POST' })
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).context).toEqual({
          endpoint: '/api/games',
          method: 'POST'
        })
      }
    })
  })
})