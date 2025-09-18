/**
 * Mock data for testing
 */

import type { Game } from '../domain/models'
import type { CollectionStats, Platform, Publisher, Condition } from '../domain/models'

export const mockGames: Game[] = [
  {
    id: 'game-1',
    name: 'The Legend of Zelda: Breath of the Wild',
    platform: 'Nintendo Switch',
    genre: 'Action-Adventure',
    releaseDate: '2017-03-03',
    description: 'An open-world action-adventure game',
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    esrbRating: 'E10+',
    metacriticScore: 97,
    userRating: 4.8,
    coverImageUrl: 'https://example.com/zelda-botw.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'game-2',
    name: 'Super Mario Odyssey',
    platform: 'Nintendo Switch',
    genre: 'Platformer',
    releaseDate: '2017-10-27',
    description: 'A 3D platform game',
    developer: 'Nintendo EPD',
    publisher: 'Nintendo',
    esrbRating: 'E10+',
    metacriticScore: 97,
    userRating: 4.7,
    coverImageUrl: 'https://example.com/mario-odyssey.jpg',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 'game-3',
    name: 'Red Dead Redemption 2',
    platform: 'PlayStation 5',
    genre: 'Action-Adventure',
    releaseDate: '2018-10-26',
    description: 'An open-world western action-adventure game',
    developer: 'Rockstar Studios',
    publisher: 'Rockstar Games',
    esrbRating: 'M',
    metacriticScore: 97,
    userRating: 4.6,
    coverImageUrl: 'https://example.com/rdr2.jpg',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: 'game-4',
    name: 'Halo Infinite',
    platform: 'Xbox Series X|S',
    genre: 'First-Person Shooter',
    releaseDate: '2021-12-08',
    description: 'The latest installment in the Halo franchise',
    developer: '343 Industries',
    publisher: 'Microsoft Studios',
    esrbRating: 'T',
    metacriticScore: 87,
    userRating: 4.2,
    coverImageUrl: 'https://example.com/halo-infinite.jpg',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  },
  {
    id: 'game-5',
    name: 'Elden Ring',
    platform: 'PC',
    genre: 'Action RPG',
    releaseDate: '2022-02-25',
    description: 'A souls-like action RPG',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco',
    esrbRating: 'M',
    metacriticScore: 96,
    userRating: 4.5,
    coverImageUrl: 'https://example.com/elden-ring.jpg',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  }
]

export const mockStats: CollectionStats = {
  totalGames: 150,
  totalCopies: 175,
  platforms: 8,
  publishers: 45,
  totalValue: 2500.00,
  averageRating: 4.3
}

export const mockPlatforms: Platform[] = [
  { id: 'platform-1', name: 'Nintendo Switch', manufacturer: 'Nintendo' },
  { id: 'platform-2', name: 'PlayStation 5', manufacturer: 'Sony' },
  { id: 'platform-3', name: 'Xbox Series X|S', manufacturer: 'Microsoft' },
  { id: 'platform-4', name: 'PC', manufacturer: 'Various' },
  { id: 'platform-5', name: 'Nintendo 3DS', manufacturer: 'Nintendo' }
]

export const mockPublishers: Publisher[] = [
  { id: 'publisher-1', name: 'Nintendo', founded: 1889 },
  { id: 'publisher-2', name: 'Sony Interactive Entertainment', founded: 1993 },
  { id: 'publisher-3', name: 'Microsoft Studios', founded: 2000 },
  { id: 'publisher-4', name: 'Rockstar Games', founded: 1998 },
  { id: 'publisher-5', name: 'FromSoftware', founded: 1986 }
]

export const mockConditions: Condition[] = [
  { id: 'condition-1', name: 'New', description: 'Brand new, sealed' },
  { id: 'condition-2', name: 'Like New', description: 'Excellent condition' },
  { id: 'condition-3', name: 'Very Good', description: 'Minor wear' },
  { id: 'condition-4', name: 'Good', description: 'Noticeable wear' },
  { id: 'condition-5', name: 'Fair', description: 'Heavy wear but functional' }
]

// Mock authentication service
export const createMockAuthService = () => ({
  isAuthenticated: true,
  isLoading: false,
  getAccessToken: vi.fn().mockResolvedValue('mock-token'),
  login: vi.fn(),
  logout: vi.fn()
})

// Mock user
export const mockUser = {
  sub: 'auth0|123456789',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
}