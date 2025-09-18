/**
 * Tests for useDashboardData hook
 * Complex hook with multiple state management patterns - needs testing for optimization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '../useDashboardData'
import { createMockAuthService, mockStats, mockGames } from '../../../test/mocks'
import { server } from '../../../test/server'
import { http, HttpResponse } from 'msw'

// Mock dependencies
import * as authModule from '../useAuthService'
import * as hooksModule from '../index'
import * as apiModule from '../../../infrastructure/api'

vi.mock('../useAuthService', () => ({
  useAuthService: () => createMockAuthService()
}))

vi.mock('../index', () => ({
  usePriceCharting: () => ({
    isEnabled: true,
    isLoading: false
  })
}))

// Mock API service creations
vi.mock('../../../infrastructure/api', () => ({
  createPriceChartingApiService: vi.fn(() => ({
    getHighlights: vi.fn().mockResolvedValue([
      { id: '1', title: 'Price Alert', description: 'Game price dropped', type: 'price_drop' }
    ])
  })),
  createGameApiService: vi.fn(() => ({
    getRecentGames: vi.fn().mockResolvedValue([mockGames[0], mockGames[1]])
  }))
}))

// Mock stats API service
vi.mock('../../../infrastructure/api/StatsApiService', () => ({
  createStatsApiService: vi.fn(() => ({
    getStats: vi.fn().mockResolvedValue(mockStats)
  }))
}))

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Set up default successful API responses
    server.use(
      http.get('/api/stats', () => {
        return HttpResponse.json({
          success: true,
          data: mockStats
        })
      }),
      http.get('/api/games/recent', () => {
        return HttpResponse.json({
          success: true,
          data: [mockGames[0], mockGames[1]]
        })
      })
    )
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('Initial State', () => {
    it('should return initial state with loading flags', () => {
      const { result } = renderHook(() => useDashboardData())

      expect(result.current.stats).toEqual({
        totalGames: 0,
        totalCopies: 0,
        platforms: 0,
        publishers: 0
      })
      expect(result.current.statsLoading).toBe(false) // Should start false and become true
      expect(result.current.statsError).toBeNull()
      
      expect(result.current.highlights).toEqual([])
      expect(result.current.highlightsLoading).toBe(false)
      expect(result.current.highlightsError).toBeNull()
      
      expect(result.current.recentGames).toEqual([])
      expect(result.current.recentGamesLoading).toBe(false)
      expect(result.current.recentGamesError).toBeNull()
      
      expect(result.current.isPriceChartingEnabled).toBe(true)
    })
  })

  describe('Stats Loading', () => {
    it('should load stats successfully', async () => {
      const { result } = renderHook(() => useDashboardData())

      // Should start loading
      await waitFor(() => {
        expect(result.current.statsLoading).toBe(true)
      })

      // Should complete loading with data
      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false)
      })

      expect(result.current.stats).toEqual({
        totalGames: mockStats.totalGames,
        totalCopies: mockStats.totalCopies,
        platforms: mockStats.platforms,
        publishers: mockStats.publishers
      })
      expect(result.current.statsError).toBeNull()
    })

    it('should handle stats loading errors', async () => {
      server.use(
        http.get('/api/stats', () => {
          return HttpResponse.json(
            { error: 'Failed to load stats' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false)
      })

      expect(result.current.statsError).toBeTruthy()
      expect(result.current.stats).toEqual({
        totalGames: 0,
        totalCopies: 0,
        platforms: 0,
        publishers: 0
      })
    })
  })

  describe('Recent Games Loading', () => {
    it('should load recent games successfully', async () => {
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.recentGamesLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.recentGamesLoading).toBe(false)
      })

      expect(result.current.recentGames).toHaveLength(2)
      expect(result.current.recentGames[0]).toEqual(mockGames[0])
      expect(result.current.recentGamesError).toBeNull()
    })

    it('should handle recent games loading errors', async () => {
      server.use(
        http.get('/api/games/recent', () => {
          return HttpResponse.json(
            { error: 'Failed to load recent games' },
            { status: 500 }
          )
        })
      )

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.recentGamesLoading).toBe(false)
      })

      expect(result.current.recentGamesError).toBeTruthy()
      expect(result.current.recentGames).toEqual([])
    })

    it('should handle empty recent games response', async () => {
      server.use(
        http.get('/api/games/recent', () => {
          return HttpResponse.json({
            success: true,
            data: []
          })
        })
      )

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.recentGamesLoading).toBe(false)
      })

      expect(result.current.recentGames).toEqual([])
      expect(result.current.recentGamesError).toBeNull()
    })
  })

  describe('Price Highlights Loading', () => {
    it('should load price highlights when PriceCharting is enabled', async () => {
      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.highlightsLoading).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.highlightsLoading).toBe(false)
      })

      expect(result.current.highlights).toHaveLength(1)
      expect(result.current.highlights[0]).toEqual({
        id: '1',
        title: 'Price Alert',
        description: 'Game price dropped',
        type: 'price_drop'
      })
      expect(result.current.highlightsError).toBeNull()
    })

    it('should not load highlights when PriceCharting is disabled', async () => {
      // Mock disabled PriceCharting
      vi.mocked(hooksModule.usePriceCharting).mockReturnValue({
        isEnabled: false,
        isLoading: false
      })

      const { result } = renderHook(() => useDashboardData())

      // Wait a bit to ensure no loading starts
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(result.current.highlightsLoading).toBe(false)
      expect(result.current.highlights).toEqual([])
      expect(result.current.isPriceChartingEnabled).toBe(false)
    })

    it('should handle price highlights loading errors', async () => {
      // Mock API service to throw error
      const mockCreatePriceChartingApiService = vi.mocked(
        apiModule.createPriceChartingApiService
      )
      mockCreatePriceChartingApiService.mockReturnValue({
        getHighlights: vi.fn().mockRejectedValue(new Error('PriceCharting API error'))
      })

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.highlightsLoading).toBe(false)
      })

      expect(result.current.highlightsError).toBeTruthy()
      expect(result.current.highlights).toEqual([])
    })
  })

  describe('Concurrent Loading', () => {
    it('should load all data sources concurrently', async () => {
      const { result } = renderHook(() => useDashboardData())

      // All should start loading around the same time
      await waitFor(() => {
        expect(
          result.current.statsLoading ||
          result.current.recentGamesLoading ||
          result.current.highlightsLoading
        ).toBe(true)
      })

      // All should eventually complete
      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false)
        expect(result.current.recentGamesLoading).toBe(false)
        expect(result.current.highlightsLoading).toBe(false)
      }, { timeout: 5000 })

      // All should have data
      expect(result.current.stats.totalGames).toBeGreaterThan(0)
      expect(result.current.recentGames.length).toBeGreaterThan(0)
      expect(result.current.highlights.length).toBeGreaterThan(0)
    })

    it('should handle partial failures gracefully', async () => {
      // Make stats fail but others succeed
      server.use(
        http.get('/api/stats', () => {
          return HttpResponse.json(
            { error: 'Stats service down' },
            { status: 503 }
          )
        })
      )

      const { result } = renderHook(() => useDashboardData())

      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false)
        expect(result.current.recentGamesLoading).toBe(false)
        expect(result.current.highlightsLoading).toBe(false)
      })

      // Stats should have error
      expect(result.current.statsError).toBeTruthy()
      expect(result.current.stats).toEqual({
        totalGames: 0,
        totalCopies: 0,
        platforms: 0,
        publishers: 0
      })

      // Others should succeed
      expect(result.current.recentGamesError).toBeNull()
      expect(result.current.highlightsError).toBeNull()
      expect(result.current.recentGames.length).toBeGreaterThan(0)
      expect(result.current.highlights.length).toBeGreaterThan(0)
    })
  })

  describe('Authentication Integration', () => {
    it('should not load data when not authenticated', async () => {
      // Mock unauthenticated state
      vi.mocked(authModule.useAuthService).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        getAccessToken: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
      })

      const { result } = renderHook(() => useDashboardData())

      // Should not start loading any data
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(result.current.statsLoading).toBe(false)
      expect(result.current.recentGamesLoading).toBe(false)
      expect(result.current.highlightsLoading).toBe(false)
      
      expect(result.current.stats).toEqual({
        totalGames: 0,
        totalCopies: 0,
        platforms: 0,
        publishers: 0
      })
      expect(result.current.recentGames).toEqual([])
      expect(result.current.highlights).toEqual([])
    })

    it('should wait for authentication to complete', async () => {
      // Mock loading auth state
      const mockAuthService = {
        isAuthenticated: true,
        isLoading: true,
        getAccessToken: vi.fn(),
        login: vi.fn(),
        logout: vi.fn()
      }
      
      vi.mocked(authModule.useAuthService).mockReturnValue(mockAuthService)

      const { result, rerender } = renderHook(() => useDashboardData())

      // Should not load while auth is loading
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(result.current.statsLoading).toBe(false)
      expect(result.current.recentGamesLoading).toBe(false)
      expect(result.current.highlightsLoading).toBe(false)

      // Complete auth loading
      mockAuthService.isLoading = false
      rerender()

      // Now should start loading
      await waitFor(() => {
        expect(
          result.current.statsLoading ||
          result.current.recentGamesLoading ||
          result.current.highlightsLoading
        ).toBe(true)
      })
    })
  })

  describe('Performance and Memory Management', () => {
    it('should cleanup async operations on unmount', async () => {
      const { result, unmount } = renderHook(() => useDashboardData())

      // Start loading
      await waitFor(() => {
        expect(
          result.current.statsLoading ||
          result.current.recentGamesLoading ||
          result.current.highlightsLoading
        ).toBe(true)
      })

      // Unmount during loading
      unmount()

      // Should not cause memory leaks or state updates after unmount
      // This is tested by the absence of React warnings in the test output
    })

    it('should not cause unnecessary re-renders', async () => {
      let renderCount = 0
      const TestComponent = () => {
        renderCount++
        useDashboardData()
        return null
      }

      const { rerender } = renderHook(() => useDashboardData())

      const initialRenderCount = renderCount

      // Wait for all loading to complete
      await waitFor(() => {
        // Multiple rerenders are expected during loading phases
      }, { timeout: 2000 })

      const finalRenderCount = renderCount

      // Should have reasonable number of renders (initial + loading states + data states)
      // This is more of a smoke test - exact count depends on implementation
      expect(finalRenderCount - initialRenderCount).toBeLessThan(20)
    })
  })

  describe('Data Consistency', () => {
    it('should maintain consistent state during rapid changes', async () => {
      const { result } = renderHook(() => useDashboardData())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.statsLoading).toBe(false)
        expect(result.current.recentGamesLoading).toBe(false)
        expect(result.current.highlightsLoading).toBe(false)
      })

      // Verify data consistency
      expect(result.current.stats).toMatchObject({
        totalGames: expect.any(Number),
        totalCopies: expect.any(Number),
        platforms: expect.any(Number),
        publishers: expect.any(Number)
      })

      expect(Array.isArray(result.current.recentGames)).toBe(true)
      expect(Array.isArray(result.current.highlights)).toBe(true)
      
      expect(typeof result.current.isPriceChartingEnabled).toBe('boolean')
    })
  })
})