/**
 * End-to-End tests for core game collection functionality
 * Tests critical user paths and business flows
 */

import { test, expect } from '@playwright/test'

test.describe('Game Collection Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to bypass Auth0
    await page.route('**/*auth0*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          token_type: 'Bearer',
          expires_in: 3600
        })
      })
    })

    // Mock API responses
    await page.route('**/api/games', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'game-1',
                name: 'The Legend of Zelda: Breath of the Wild',
                platform: 'Nintendo Switch',
                genre: 'Action-Adventure',
                releaseDate: '2017-03-03',
                coverImageUrl: 'https://example.com/zelda.jpg'
              },
              {
                id: 'game-2',
                name: 'Super Mario Odyssey',
                platform: 'Nintendo Switch',
                genre: 'Platformer',
                releaseDate: '2017-10-27',
                coverImageUrl: 'https://example.com/mario.jpg'
              }
            ],
            meta: {
              total: 2,
              totalPages: 1,
              hasMore: false
            }
          })
        })
      }
    })

    await page.route('**/api/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalGames: 2,
            totalCopies: 2,
            platforms: 1,
            publishers: 2,
            totalValue: 120.00,
            averageRating: 4.5
          }
        })
      })
    })
  })

  test('should display game collection on main page', async ({ page }) => {
    await page.goto('/collection')

    // Should show collection header
    await expect(page.locator('h1')).toContainText('My Collection')
    
    // Should show game count
    await expect(page.getByText('2 games')).toBeVisible()
    
    // Should show games in the list
    await expect(page.getByText('The Legend of Zelda: Breath of the Wild')).toBeVisible()
    await expect(page.getByText('Super Mario Odyssey')).toBeVisible()
    
    // Should show platform information
    await expect(page.getByText('Nintendo Switch')).toBeVisible()
  })

  test('should search games in collection', async ({ page }) => {
    await page.goto('/collection')

    // Wait for games to load
    await expect(page.getByText('The Legend of Zelda')).toBeVisible()

    // Enter search term
    const searchInput = page.getByPlaceholder('Search your collection...')
    await searchInput.fill('Zelda')

    // Should filter results (mocked behavior)
    await expect(searchInput).toHaveValue('Zelda')
    
    // Clear search
    await page.getByRole('button', { name: /clear search/i }).click()
    await expect(searchInput).toHaveValue('')
  })

  test('should switch between list and console views', async ({ page }) => {
    await page.goto('/collection')

    // Should start in list view
    await expect(page.getByRole('button', { name: /list/i })).toHaveClass(/bg-cyan-500/)
    
    // Switch to console view
    await page.getByRole('button', { name: /console/i }).click()
    await expect(page.getByRole('button', { name: /console/i })).toHaveClass(/bg-cyan-500/)
    
    // Switch back to list view
    await page.getByRole('button', { name: /list/i }).click()
    await expect(page.getByRole('button', { name: /list/i })).toHaveClass(/bg-cyan-500/)
  })

  test('should navigate to add game page', async ({ page }) => {
    await page.goto('/collection')

    // Click Add Game button
    await page.getByRole('button', { name: /add game/i }).click()

    // Should navigate to add game page
    await expect(page).toHaveURL(/.*\/add-game/)
  })

  test('should handle loading states', async ({ page }) => {
    // Delay API response to test loading state
    await page.route('**/api/games', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { total: 0 }
        })
      })
    })

    await page.goto('/collection')

    // Should show loading spinner
    await expect(page.getByText('Loading your games...')).toBeVisible()
    
    // Should hide loading spinner after data loads
    await expect(page.getByText('Loading your games...')).not.toBeVisible({ timeout: 10000 })
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/games', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error'
        })
      })
    })

    await page.goto('/collection')

    // Should show error message
    await expect(page.getByText('Failed to load games')).toBeVisible()
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/collection')

    // Header should stack vertically on mobile
    const header = page.locator('h1').locator('..')
    await expect(header).toHaveClass(/flex-col/)

    // View mode toggle should be visible on mobile
    await expect(page.getByRole('button', { name: /list/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /console/i })).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/collection')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.getByPlaceholder('Search your collection...')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /list/i })).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /console/i })).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /add game/i })).toBeFocused()

    // Should activate buttons with Enter/Space
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/.*\/add-game/)
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/*auth0*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token'
        })
      })
    })

    // Mock dashboard APIs
    await page.route('**/api/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalGames: 150,
            totalCopies: 175,
            platforms: 8,
            publishers: 45,
            totalValue: 2500.00,
            averageRating: 4.3
          }
        })
      })
    })

    await page.route('**/api/games/recent', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'recent-1',
              name: 'Elden Ring',
              platform: 'PC',
              addedDate: '2024-01-15T10:30:00Z'
            }
          ]
        })
      })
    })
  })

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/')

    // Should show stats cards
    await expect(page.getByText('150')).toBeVisible() // Total games
    await expect(page.getByText('175')).toBeVisible() // Total copies
    await expect(page.getByText('8')).toBeVisible()   // Platforms
    await expect(page.getByText('45')).toBeVisible()  // Publishers

    // Should show recent games
    await expect(page.getByText('Recent Games')).toBeVisible()
    await expect(page.getByText('Elden Ring')).toBeVisible()
  })

  test('should navigate to collection from dashboard', async ({ page }) => {
    await page.goto('/')

    // Click on collection link/button
    await page.getByRole('link', { name: /my collection/i }).click()

    // Should navigate to collection page
    await expect(page).toHaveURL(/.*\/collection/)
  })
})

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users', async ({ page }) => {
    // Don't mock authentication for this test
    await page.goto('/')

    // Should show login page or Auth0 login
    // This depends on your Auth0 configuration
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('should show user menu when authenticated', async ({ page }) => {
    // Mock authenticated state
    await page.route('**/*auth0*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-token',
          user: {
            name: 'Test User',
            email: 'test@example.com',
            picture: 'https://example.com/avatar.jpg'
          }
        })
      })
    })

    await page.goto('/')

    // Should show user avatar/menu
    await expect(page.getByRole('button', { name: /user menu/i })).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load main pages quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/collection')
    await expect(page.getByText('My Collection')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large dataset
    const largeGameSet = Array.from({ length: 1000 }, (_, i) => ({
      id: `game-${i}`,
      name: `Game ${i}`,
      platform: 'PC',
      genre: 'Action'
    }))

    await page.route('**/api/games', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: largeGameSet.slice(0, 20), // Paginated
          meta: {
            total: 1000,
            totalPages: 50,
            hasMore: true
          }
        })
      })
    })

    const startTime = Date.now()
    await page.goto('/collection')
    
    // Should still render quickly even with large dataset
    await expect(page.getByText('1000 games')).toBeVisible()
    
    const renderTime = Date.now() - startTime
    expect(renderTime).toBeLessThan(2000)
  })
})