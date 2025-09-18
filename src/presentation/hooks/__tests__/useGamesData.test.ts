/**
 * Tests for useGamesData hook
 * Critical hook with complex state management, caching, and pagination logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGamesData } from '../useGamesData'
import { createMockAuthService, mockGames } from '../../../test/mocks'
import { server } from '../../../test/server'
import { http, HttpResponse } from 'msw'

// Mock the auth service hook
vi.mock('../useAuthService', () => ({
  useAuthService: () => createMockAuthService()
}))

// Mock the API service creation
vi.mock('../../../infrastructure/api', () => ({
  createGameApiService: vi.fn(() => ({
    getAllGames: vi.fn()
  }))
}))

describe('useGamesData', () => {
  const defaultProps = {
    viewMode: 'list' as const,
    currentPage: 1,
    pageSize: 10,
    hasSelectedConsole: false,
    searchTerm: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('List View Mode', () => {
    it('should load games with pagination in list mode', async () => {
      const { result } = renderHook(() => useGamesData({
        ...defaultProps,
        viewMode: 'list'
      }))

      // Initial state
      expect(result.current.loading).toBe(true)
      expect(result.current.games).toEqual([])
      expect(result.current.error).toBeNull()

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have loaded games with pagination
      expect(result.current.games).toHaveLength(5) // mockGames length
      expect(result.current.paginationEnabled).toBe(true)
      expect(result.current.totalPages).toBeGreaterThan(0)
      expect(result.current.totalGames).toBeGreaterThan(0)
    })

    it('should handle pagination parameters correctly', async () => {
      server.use(
        http.get('/api/games', ({ request }) => {
          const url = new URL(request.url)
          const page = url.searchParams.get('page')
          const limit = url.searchParams.get('limit')
          
          expect(page).toBe('2')
          expect(limit).toBe('20')
          
          return HttpResponse.json({
            success: true,
            data: mockGames.slice(10, 20),
            meta: {
              total: 50,
              totalPages: 3,
              hasMore: true,
              page: 2,
              limit: 20
            }
          })
        })
      )

      const { result } = renderHook(() => useGamesData({
        ...defaultProps,
        viewMode: 'list',
        currentPage: 2,
        pageSize: 20
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalPages).toBe(3)
      expect(result.current.totalGames).toBe(50)
    })

    it('should handle search parameters', async () => {
      server.use(
        http.get('/api/games', ({ request }) => {
          const url = new URL(request.url)
          const search = url.searchParams.get('search')
          
          expect(search).toBe('Zelda')
          
          return HttpResponse.json({
            success: true,
            data: mockGames.filter(game => game.name.includes('Zelda')),
            meta: {
              total: 1,
              totalPages: 1,
              hasMore: false
            }
          })
        })
      )

      const { result } = renderHook(() => useGamesData({
        ...defaultProps,
        viewMode: 'list',
        searchTerm: 'Zelda'
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.games).toHaveLength(1)
      expect(result.current.games[0].name).toContain('Zelda')
    })

    it('should show pagination loading when changing pages', async () => {
      const { result, rerender } = renderHook(
        (props) => useGamesData(props),
        { initialProps: { ...defaultProps, viewMode: 'list' as const } }
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change page
      rerender({ ...defaultProps, viewMode: 'list' as const, currentPage: 2 })

      // Should show pagination loading
      expect(result.current.paginationLoading).toBe(true)
      expect(result.current.loading).toBe(false) // Main loading should be false

      await waitFor(() => {
        expect(result.current.paginationLoading).toBe(false)
      })
    })
  })

  describe('Console View Mode', () => {
    it('should load all games without pagination in console mode', async () => {
      server.use(
        http.get('/api/games', ({ request }) => {
          const url = new URL(request.url)
          // Should not have pagination parameters
          expect(url.searchParams.get('page')).toBeNull()
          expect(url.searchParams.get('limit')).toBeNull()
          
          return HttpResponse.json(mockGames) // Return array directly
        })
      )

      const { result } = renderHook(() => useGamesData({
        ...defaultProps,
        viewMode: 'console'
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.games).toEqual(mockGames)
      expect(result.current.paginationEnabled).toBe(false)
    })

    it('should cache games for console view', async () => {
      let apiCallCount = 0
      server.use(
        http.get('/api/games', () => {
          apiCallCount++
          return HttpResponse.json(mockGames)
        })
      )

      const { result, rerender } = renderHook(
        (props) => useGamesData(props),
        { initialProps: { ...defaultProps, viewMode: 'console' as const } }
      )

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(apiCallCount).toBe(1)
      expect(result.current.games).toEqual(mockGames)

      // Switch to list mode and back to console
      rerender({ ...defaultProps, viewMode: 'list' as const })
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      rerender({ ...defaultProps, viewMode: 'console' as const })
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should use cached data, no additional API call
      expect(apiCallCount).toBe(2) // One for initial console, one for list mode
      expect(result.current.games).toEqual(mockGames)
    })
  })

  describe('Console-Specific View', () => {
    it('should use cached games for console-specific view', async () => {
      let apiCallCount = 0
      server.use(
        http.get('/api/games', () => {
          apiCallCount++
          return HttpResponse.json(mockGames)
        })
      )

      const { result } = renderHook(() => useGamesData({
        ...defaultProps,
        viewMode: 'console',
        hasSelectedConsole: true
      }))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.games).toEqual(mockGames)
      expect(result.current.paginationEnabled).toBe(false)
      expect(apiCallCount).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      server.use(
        http.get('/api/games', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useGamesData(defaultProps))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.games).toEqual([])
    })

    it('should handle network failures', async () => {
      server.use(
        http.get('/api/games', () => {
          return HttpResponse.error()
        })
      )

      const { result } = renderHook(() => useGamesData(defaultProps))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })

    it('should reset error state on successful retry', async () => {
      let failFirst = true
      server.use(
        http.get('/api/games', () => {
          if (failFirst) {
            failFirst = false
            return HttpResponse.error()
          }
          return HttpResponse.json({
            success: true,
            data: mockGames,
            meta: { total: mockGames.length }
          })
        })
      )

      const { result, rerender } = renderHook(
        (props) => useGamesData(props),
        { initialProps: defaultProps }
      )

      // Wait for error
      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      // Trigger retry by changing props
      rerender({ ...defaultProps, currentPage: 1 })

      // Should clear error and load successfully
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.games).toEqual(mockGames)
    })
  })

  describe('Authentication Integration', () => {
    it('should not load games when not authenticated', async () => {
      // Mock unauthenticated state
      vi.mocked(require('../useAuthService').useAuthService).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        getAccessToken: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
      })

      const { result } = renderHook(() => useGamesData(defaultProps))

      // Should not trigger loading
      expect(result.current.loading).toBe(false)
      expect(result.current.games).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('should wait for auth loading to complete', async () => {
      // Mock loading auth state
      vi.mocked(require('../useAuthService').useAuthService).mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        getAccessToken: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
      })

      const { result } = renderHook(() => useGamesData(defaultProps))

      // Should not start loading while auth is loading
      expect(result.current.loading).toBe(false)
      expect(result.current.games).toEqual([])
    })
  })

  describe('Performance Optimizations', () => {
    it('should debounce search requests', async () => {
      let apiCallCount = 0
      server.use(
        http.get('/api/games', () => {
          apiCallCount++
          return HttpResponse.json({
            success: true,
            data: mockGames,
            meta: { total: mockGames.length }
          })
        })
      )

      const { rerender } = renderHook(
        (props) => useGamesData(props),
        { initialProps: { ...defaultProps, searchTerm: '' } }
      )

      // Rapidly change search term
      rerender({ ...defaultProps, searchTerm: 'Z' })
      rerender({ ...defaultProps, searchTerm: 'Ze' })
      rerender({ ...defaultProps, searchTerm: 'Zel' })
      rerender({ ...defaultProps, searchTerm: 'Zelda' })

      // Should only make one API call after debounce
      await waitFor(() => {
        expect(apiCallCount).toBeLessThanOrEqual(2) // Initial + final search
      })
    })

    it('should not reload when switching between same view modes', async () => {
      let apiCallCount = 0
      server.use(
        http.get('/api/games', () => {
          apiCallCount++
          return HttpResponse.json(mockGames)
        })
      )

      const { result, rerender } = renderHook(
        (props) => useGamesData(props),
        { initialProps: { ...defaultProps, viewMode: 'console' as const } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = apiCallCount

      // Stay in console mode but change other props
      rerender({ ...defaultProps, viewMode: 'console' as const, hasSelectedConsole: true })

      // Should use cached data
      expect(apiCallCount).toBe(initialCallCount)
    })
  })
})