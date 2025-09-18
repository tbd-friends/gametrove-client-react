/**
 * MSW Server for API Mocking
 * Provides mock responses for API calls during testing
 */

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { mockGames, mockStats, mockPlatforms, mockPublishers, mockConditions } from './mocks'

const handlers = [
  // Games API
  http.get('/api/games', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search')

    let filteredGames = mockGames
    if (search) {
      filteredGames = mockGames.filter(game => 
        game.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedGames = filteredGames.slice(startIndex, endIndex)

    return HttpResponse.json({
      success: true,
      data: paginatedGames,
      meta: {
        total: filteredGames.length,
        totalPages: Math.ceil(filteredGames.length / limit),
        hasMore: endIndex < filteredGames.length,
        page,
        limit
      }
    })
  }),

  http.get('/api/games/:id', ({ params }) => {
    const { id } = params
    const game = mockGames.find(g => g.id === id)
    
    if (!game) {
      return HttpResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: game
    })
  }),

  http.post('/api/games', async ({ request }) => {
    const gameData = await request.json() as any
    const newGame = {
      id: `game-${Date.now()}`,
      ...gameData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return HttpResponse.json({
      success: true,
      data: newGame.id
    }, { status: 201 })
  }),

  http.put('/api/games/:id', async ({ params, request }) => {
    const { id } = params
    const gameData = await request.json() as any
    const existingGame = mockGames.find(g => g.id === id)
    
    if (!existingGame) {
      return HttpResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: { ...existingGame, ...gameData, updatedAt: new Date().toISOString() }
    })
  }),

  // Stats API
  http.get('/api/stats', () => {
    return HttpResponse.json({
      success: true,
      data: mockStats
    })
  }),

  // Platforms API
  http.get('/api/platforms', () => {
    return HttpResponse.json({
      success: true,
      data: mockPlatforms
    })
  }),

  // Publishers API
  http.get('/api/publishers', () => {
    return HttpResponse.json({
      success: true,
      data: mockPublishers
    })
  }),

  // Conditions API
  http.get('/api/conditions', () => {
    return HttpResponse.json({
      success: true,
      data: mockConditions
    })
  }),

  // Auth errors for testing
  http.get('/api/auth-error', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  // Server errors for testing
  http.get('/api/server-error', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  // Network timeout simulation
  http.get('/api/timeout', () => {
    return new Promise(() => {
      // Never resolves - simulates timeout
    })
  }),
]

export const server = setupServer(...handlers)