/**
 * Tests for the structured error handling system
 * Critical for ensuring consistent error handling across the application
 */

import { describe, it, expect } from 'vitest'
import { ApiError, ErrorCategory } from '../ApiError'

describe('ApiError', () => {
  describe('Constructor', () => {
    it('should create an error with all properties', () => {
      const context = { endpoint: '/api/games', method: 'GET' }
      const error = new ApiError(
        'Game not found',
        ErrorCategory.NOT_FOUND,
        404,
        'The game you requested could not be found',
        false,
        context
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.name).toBe('ApiError')
      expect(error.message).toBe('Game not found')
      expect(error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.statusCode).toBe(404)
      expect(error.userMessage).toBe('The game you requested could not be found')
      expect(error.isRetryable).toBe(false)
      expect(error.context.endpoint).toBe('/api/games')
      expect(error.context.method).toBe('GET')
      expect(error.context.timestamp).toBeInstanceOf(Date)
    })

    it('should set default values for optional parameters', () => {
      const error = new ApiError(
        'Server error',
        ErrorCategory.SERVER,
        500,
        'Something went wrong'
      )

      expect(error.isRetryable).toBe(false)
      expect(error.context).toEqual({ timestamp: expect.any(Date) })
      expect(error.originalError).toBeUndefined()
    })

    it('should preserve original error', () => {
      const originalError = new Error('Database connection failed')
      const error = new ApiError(
        'Failed to fetch games',
        ErrorCategory.SERVER,
        500,
        'Unable to load games',
        true,
        {},
        originalError
      )

      expect(error.originalError).toBe(originalError)
    })
  })

  describe('ErrorCategory const assertion', () => {
    it('should work with const assertion pattern', () => {
      expect(ErrorCategory.AUTHENTICATION).toBe('AUTHENTICATION')
      expect(ErrorCategory.AUTHORIZATION).toBe('AUTHORIZATION')
      expect(ErrorCategory.VALIDATION).toBe('VALIDATION')
      expect(ErrorCategory.NETWORK).toBe('NETWORK')
      expect(ErrorCategory.SERVER).toBe('SERVER')
      expect(ErrorCategory.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCategory.CONFLICT).toBe('CONFLICT')
      expect(ErrorCategory.RATE_LIMIT).toBe('RATE_LIMIT')
      expect(ErrorCategory.UNKNOWN).toBe('UNKNOWN')
    })

    it('should be tree-shakable', () => {
      // This test ensures the const assertion pattern allows for tree shaking
      const usedCategories = [ErrorCategory.AUTHENTICATION, ErrorCategory.SERVER]
      expect(usedCategories).toContain('AUTHENTICATION')
      expect(usedCategories).toContain('SERVER')
    })
  })

  describe('Factory Methods - fromHttpResponse', () => {
    it('should create authentication error for 401 status', () => {
      const response = new Response('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized'
      })
      Object.defineProperty(response, 'url', { value: '/api/games' })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(error.statusCode).toBe(401)
      expect(error.userMessage).toBe('Please log in to continue')
      expect(error.isRetryable).toBe(false)
    })

    it('should create authorization error for 403 status', () => {
      const response = new Response('Forbidden', {
        status: 403,
        statusText: 'Forbidden'
      })
      Object.defineProperty(response, 'url', { value: '/api/admin' })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.AUTHORIZATION)
      expect(error.statusCode).toBe(403)
      expect(error.userMessage).toBe('You do not have permission to perform this action')
      expect(error.isRetryable).toBe(false)
    })

    it('should create not found error for 404 status', () => {
      const response = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.statusCode).toBe(404)
      expect(error.userMessage).toBe('The requested resource was not found')
      expect(error.isRetryable).toBe(false)
    })

    it('should create conflict error for 409 status', () => {
      const response = new Response('Conflict', {
        status: 409,
        statusText: 'Conflict'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.CONFLICT)
      expect(error.statusCode).toBe(409)
      expect(error.userMessage).toBe('This action conflicts with existing data')
      expect(error.isRetryable).toBe(false)
    })

    it('should create validation error for 422 status', () => {
      const response = new Response('Unprocessable Entity', {
        status: 422,
        statusText: 'Unprocessable Entity'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.statusCode).toBe(422)
      expect(error.userMessage).toBe('Please check your input and try again')
      expect(error.isRetryable).toBe(false)
    })

    it('should create rate limit error for 429 status', () => {
      const response = new Response('Too Many Requests', {
        status: 429,
        statusText: 'Too Many Requests'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.RATE_LIMIT)
      expect(error.statusCode).toBe(429)
      expect(error.userMessage).toBe('Too many requests. Please wait a moment and try again')
      expect(error.isRetryable).toBe(true)
    })

    it('should create server error for 5xx status', () => {
      const response = new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.SERVER)
      expect(error.statusCode).toBe(500)
      expect(error.userMessage).toBe('A server error occurred. Please try again later')
      expect(error.isRetryable).toBe(true)
    })

    it('should create network error for other status codes', () => {
      const response = new Response('Bad Request', {
        status: 400,
        statusText: 'Bad Request'
      })

      const error = ApiError.fromHttpResponse(response)

      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.userMessage).toBe('A network error occurred. Please check your connection')
      expect(error.isRetryable).toBe(true)
    })

    it('should include context information', () => {
      const response = new Response('Not Found', { status: 404 })
      Object.defineProperty(response, 'url', { value: '/api/games/123' })

      const context = { userId: '456' }
      const error = ApiError.fromHttpResponse(response, context)

      expect(error.context.endpoint).toBe('/api/games/123')
      expect(error.context.method).toBe('UNKNOWN')
      expect(error.context.userId).toBe('456')
    })
  })

  describe('Factory Methods - fromError', () => {
    it('should preserve existing ApiError', () => {
      const originalError = new ApiError(
        'Original message',
        ErrorCategory.VALIDATION,
        422,
        'Original user message',
        false,
        { endpoint: '/api/games' }
      )

      const newError = ApiError.fromError(originalError, { userId: '123' })

      expect(newError).not.toBe(originalError) // Should be a new instance
      expect(newError.message).toBe('Original message')
      expect(newError.category).toBe(ErrorCategory.VALIDATION)
      expect(newError.statusCode).toBe(422)
      expect(newError.userMessage).toBe('Original user message')
      expect(newError.context.endpoint).toBe('/api/games')
      expect(newError.context.userId).toBe('123')
      expect(newError.originalError).toBe(originalError)
    })

    it('should handle TypeError fetch errors', () => {
      const fetchError = new TypeError('Failed to fetch')
      const error = ApiError.fromError(fetchError)

      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.userMessage).toBe('Network connection failed. Please check your internet connection')
      expect(error.isRetryable).toBe(true)
      expect(error.originalError).toBe(fetchError)
    })

    it('should handle AbortError', () => {
      const abortError = new Error('Request aborted')
      abortError.name = 'AbortError'
      const error = ApiError.fromError(abortError)

      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.userMessage).toBe('Request was cancelled or timed out')
      expect(error.isRetryable).toBe(true)
    })

    it('should handle TimeoutError', () => {
      const timeoutError = new Error('Request timeout')
      timeoutError.name = 'TimeoutError'
      const error = ApiError.fromError(timeoutError)

      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.userMessage).toBe('Request timed out. Please try again')
      expect(error.isRetryable).toBe(true)
    })

    it('should handle generic errors with custom category', () => {
      const genericError = new Error('Something went wrong')
      const error = ApiError.fromError(genericError, {}, ErrorCategory.SERVER)

      expect(error.category).toBe(ErrorCategory.SERVER)
      expect(error.message).toBe('Something went wrong')
      expect(error.userMessage).toBe('An unexpected error occurred')
      expect(error.isRetryable).toBe(false)
    })
  })

  describe('Convenience Factory Methods', () => {
    it('should create authentication errors', () => {
      const context = { endpoint: '/api/secure' }
      const error = ApiError.authentication('Token expired', context)

      expect(error.category).toBe(ErrorCategory.AUTHENTICATION)
      expect(error.statusCode).toBe(401)
      expect(error.userMessage).toBe('Please log in to continue')
      expect(error.isRetryable).toBe(false)
      expect(error.context.endpoint).toBe('/api/secure')
    })

    it('should create authorization errors', () => {
      const error = ApiError.authorization('Insufficient permissions')

      expect(error.category).toBe(ErrorCategory.AUTHORIZATION)
      expect(error.statusCode).toBe(403)
      expect(error.userMessage).toBe('You do not have permission to perform this action')
    })

    it('should create validation errors with custom user message', () => {
      const error = ApiError.validation('Email format invalid', 'Please enter a valid email address')

      expect(error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.statusCode).toBe(422)
      expect(error.userMessage).toBe('Please enter a valid email address')
      expect(error.isRetryable).toBe(false)
    })

    it('should create not found errors', () => {
      const error = ApiError.notFound('Game not found', 'The requested game does not exist')

      expect(error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.statusCode).toBe(404)
      expect(error.userMessage).toBe('The requested game does not exist')
    })

    it('should create network errors', () => {
      const error = ApiError.network('Connection failed')

      expect(error.category).toBe(ErrorCategory.NETWORK)
      expect(error.statusCode).toBe(0)
      expect(error.userMessage).toBe('Network connection failed. Please check your internet connection')
      expect(error.isRetryable).toBe(true)
    })

    it('should create server errors', () => {
      const error = ApiError.server('Database connection failed')

      expect(error.category).toBe(ErrorCategory.SERVER)
      expect(error.statusCode).toBe(500)
      expect(error.userMessage).toBe('A server error occurred. Please try again later')
      expect(error.isRetryable).toBe(true)
    })
  })

  describe('Utility Methods', () => {
    it('should serialize to JSON correctly', () => {
      const error = new ApiError(
        'Test error',
        ErrorCategory.VALIDATION,
        422,
        'User friendly message',
        false,
        { endpoint: '/api/test' }
      )

      const json = error.toJSON()

      expect(json).toEqual({
        name: 'ApiError',
        message: 'Test error',
        category: ErrorCategory.VALIDATION,
        statusCode: 422,
        userMessage: 'User friendly message',
        isRetryable: false,
        context: { endpoint: '/api/test', timestamp: expect.any(Date) },
        stack: expect.any(String)
      })
    })

    it('should convert to string correctly', () => {
      const error = new ApiError(
        'Test error',
        ErrorCategory.NETWORK,
        0,
        'Network issue'
      )

      const string = error.toString()
      expect(string).toBe('ApiError [NETWORK]: Test error')
    })
  })

  describe('Stack Trace', () => {
    it('should maintain proper stack trace', () => {
      const error = new ApiError(
        'Test error',
        ErrorCategory.UNKNOWN,
        0,
        'Test message'
      )

      expect(error.stack).toContain('ApiError')
      expect(error.stack).toContain('Test error')
    })
  })
})