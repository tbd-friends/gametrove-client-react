/**
 * Integration tests for MyCollection component
 * Critical component with complex state management and user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/utils'
import { MyCollection } from '../MyCollection'
import { mockGames } from '../../../test/mocks'
import { server } from '../../../test/server'
import { http, HttpResponse } from 'msw'

// Mock the custom hooks used by MyCollection
import * as hooks from '../../hooks'

vi.mock('../../hooks', () => ({
  usePagination: vi.fn(() => ({
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalItems: 5,
    handlePageChange: vi.fn(),
    handleNextPage: vi.fn(),
    handlePreviousPage: vi.fn(),
    setPaginationData: vi.fn(),
    resetToFirstPage: vi.fn()
  })),
  useGamesData: vi.fn(() => ({
    games: mockGames,
    loading: false,
    paginationLoading: false,
    error: null,
    paginationEnabled: false,
    totalGames: mockGames.length,
    totalPages: 1
  })),
  useCollectionSearch: vi.fn(() => ({
    searchValue: '',
    debouncedSearchValue: '',
    setSearchValue: vi.fn(),
    isSearchFieldFocused: false,
    setIsSearchFieldFocused: vi.fn()
  })),
  useViewMode: vi.fn(() => ({
    viewMode: 'list',
    updateViewMode: vi.fn()
  })),
  useBarcodeIntegration: vi.fn(() => ({
    lastBarcodeSearch: null,
    setLastBarcodeSearch: vi.fn(),
    searchPriceChartingForBarcode: vi.fn()
  })),
  useConsoleData: vi.fn(() => ({
    selectedConsole: null,
    filteredGames: mockGames
  }))
}))

// Mock components to avoid complex child component rendering
vi.mock('../../components/collection', () => ({
  GamesTable: ({ games }: { games: any[] }) => (
    <div data-testid="games-table">
      {games.map(game => (
        <div key={game.id} data-testid={`game-${game.id}`}>
          {game.name}
        </div>
      ))}
    </div>
  ),
  ConsolesGrid: ({ games, onConsoleClick }: { games: any[], onConsoleClick: (console: any) => void }) => (
    <div data-testid="consoles-grid">
      <button onClick={() => onConsoleClick({ name: 'Nintendo Switch' })}>
        Nintendo Switch Console
      </button>
    </div>
  ),
  PaginationControls: ({ currentPage, totalPages }: { currentPage: number, totalPages: number }) => (
    <div data-testid="pagination-controls">
      Page {currentPage} of {totalPages}
    </div>
  )
}))

vi.mock('../../components/common', () => ({
  Breadcrumb: ({ items }: { items: any[] }) => (
    <nav data-testid="breadcrumb">
      {items.map((item, index) => (
        <span key={index}>{item.label}</span>
      ))}
    </nav>
  )
}))

describe('MyCollection', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    server.resetHandlers()
  })

  describe('Initial Render', () => {
    it('should render the collection page with games list', async () => {
      renderWithProviders(<MyCollection />)

      expect(screen.getByText('My Collection')).toBeInTheDocument()
      expect(screen.getByText('5 games')).toBeInTheDocument()
      expect(screen.getByTestId('games-table')).toBeInTheDocument()
      
      // Should show all mock games
      mockGames.forEach(game => {
        expect(screen.getByTestId(`game-${game.id}`)).toBeInTheDocument()
        expect(screen.getByText(game.name)).toBeInTheDocument()
      })
    })

    it('should render search input', () => {
      renderWithProviders(<MyCollection />)

      const searchInput = screen.getByPlaceholderText('Search your collection...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('should render view mode toggle for non-console view', () => {
      renderWithProviders(<MyCollection />)

      expect(screen.getByText('List')).toBeInTheDocument()
      expect(screen.getByText('Console')).toBeInTheDocument()
    })

    it('should render Add Game button', () => {
      renderWithProviders(<MyCollection />)

      const addButton = screen.getByRole('button', { name: /add game/i })
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner when loading games', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: [],
        loading: true,
        paginationLoading: false,
        error: null,
        paginationEnabled: false,
        totalGames: 0,
        totalPages: 0
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByText('Loading your games...')).toBeInTheDocument()
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument() // Loading spinner
    })

    it('should show pagination loading overlay', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: mockGames,
        loading: false,
        paginationLoading: true,
        error: null,
        paginationEnabled: true,
        totalGames: mockGames.length,
        totalPages: 1
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      // Should still show existing content behind overlay
      expect(screen.getByTestId('games-table')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('should show error message when games fail to load', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: [],
        loading: false,
        paginationLoading: false,
        error: 'Failed to connect to server',
        paginationEnabled: false,
        totalGames: 0,
        totalPages: 0
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByText('Failed to load games')).toBeInTheDocument()
      expect(screen.getByText('Failed to connect to server')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('should reload page when retry button is clicked', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: [],
        loading: false,
        paginationLoading: false,
        error: 'Network error',
        paginationEnabled: false,
        totalGames: 0,
        totalPages: 0
      })

      // Mock window.location.reload
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      renderWithProviders(<MyCollection />)

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('Search Functionality', () => {
    it('should update search value when typing', async () => {
      const mockSetSearchValue = vi.fn()
      const mockUseCollectionSearch = vi.mocked(hooks.useCollectionSearch)
      mockUseCollectionSearch.mockReturnValue({
        searchValue: '',
        debouncedSearchValue: '',
        setSearchValue: mockSetSearchValue,
        isSearchFieldFocused: false,
        setIsSearchFieldFocused: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      const searchInput = screen.getByPlaceholderText('Search your collection...')
      await user.type(searchInput, 'Zelda')

      expect(mockSetSearchValue).toHaveBeenCalledTimes(5) // One call per character
      expect(mockSetSearchValue).toHaveBeenLastCalledWith('Zelda')
    })

    it('should show clear button when search has value', () => {
      const mockUseCollectionSearch = vi.mocked(hooks.useCollectionSearch)
      mockUseCollectionSearch.mockReturnValue({
        searchValue: 'Zelda',
        debouncedSearchValue: 'Zelda',
        setSearchValue: vi.fn(),
        isSearchFieldFocused: false,
        setIsSearchFieldFocused: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', async () => {
      const mockSetSearchValue = vi.fn()
      const mockUseCollectionSearch = vi.mocked(hooks.useCollectionSearch)
      mockUseCollectionSearch.mockReturnValue({
        searchValue: 'Zelda',
        debouncedSearchValue: 'Zelda',
        setSearchValue: mockSetSearchValue,
        isSearchFieldFocused: false,
        setIsSearchFieldFocused: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      await user.click(clearButton)

      expect(mockSetSearchValue).toHaveBeenCalledWith('')
    })

    it('should handle barcode scanner integration', async () => {
      const mockSetIsSearchFieldFocused = vi.fn()
      const mockUseCollectionSearch = vi.mocked(hooks.useCollectionSearch)
      mockUseCollectionSearch.mockReturnValue({
        searchValue: '',
        debouncedSearchValue: '',
        setSearchValue: vi.fn(),
        isSearchFieldFocused: false,
        setIsSearchFieldFocused: mockSetIsSearchFieldFocused
      })

      renderWithProviders(<MyCollection />)

      const searchInput = screen.getByPlaceholderText('Search your collection...')
      
      // Focus should disable barcode scanner
      await user.click(searchInput)
      expect(mockSetIsSearchFieldFocused).toHaveBeenCalledWith(true)
      
      // Blur should enable barcode scanner
      await user.tab() // Move focus away
      expect(mockSetIsSearchFieldFocused).toHaveBeenCalledWith(false)
    })
  })

  describe('View Mode Switching', () => {
    it('should switch to console view when console button is clicked', async () => {
      const mockUpdateViewMode = vi.fn()
      const mockUseViewMode = vi.mocked(hooks.useViewMode)
      mockUseViewMode.mockReturnValue({
        viewMode: 'list',
        updateViewMode: mockUpdateViewMode
      })

      renderWithProviders(<MyCollection />)

      const consoleButton = screen.getByRole('button', { name: /console/i })
      await user.click(consoleButton)

      expect(mockUpdateViewMode).toHaveBeenCalledWith('console')
    })

    it('should show consoles grid in console view mode', () => {
      const mockUseViewMode = vi.mocked(hooks.useViewMode)
      mockUseViewMode.mockReturnValue({
        viewMode: 'console',
        updateViewMode: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByTestId('consoles-grid')).toBeInTheDocument()
      expect(screen.queryByTestId('games-table')).not.toBeInTheDocument()
    })

    it('should navigate to console page when console is clicked', async () => {
      const mockNavigate = vi.fn()
      // Mock useNavigate hook
      vi.doMock('react-router-dom', () => ({
        ...vi.importActual('react-router-dom'),
        useNavigate: () => mockNavigate,
        useParams: () => ({})
      }))

      const mockUseViewMode = vi.mocked(hooks.useViewMode)
      mockUseViewMode.mockReturnValue({
        viewMode: 'console',
        updateViewMode: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      const consoleButton = screen.getByText('Nintendo Switch Console')
      await user.click(consoleButton)

      expect(mockNavigate).toHaveBeenCalledWith('/collection/console/nintendo-switch')
    })
  })

  describe('Console-Specific View', () => {
    it('should show breadcrumb for console-specific view', () => {
      const mockUseConsoleData = vi.mocked(hooks.useConsoleData)
      mockUseConsoleData.mockReturnValue({
        selectedConsole: { name: 'Nintendo Switch' },
        filteredGames: mockGames.filter(game => game.platform === 'Nintendo Switch')
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument()
      expect(screen.getByText('My Collection')).toBeInTheDocument()
      expect(screen.getByText('Nintendo Switch')).toBeInTheDocument()
    })

    it('should hide view mode toggle for console-specific view', () => {
      const mockUseConsoleData = vi.mocked(hooks.useConsoleData)
      mockUseConsoleData.mockReturnValue({
        selectedConsole: { name: 'Nintendo Switch' },
        filteredGames: mockGames.filter(game => game.platform === 'Nintendo Switch')
      })

      renderWithProviders(<MyCollection />)

      // View mode toggle should not be visible when viewing a specific console
      expect(screen.queryByText('List')).not.toBeInTheDocument()
      expect(screen.queryByText('Console')).not.toBeInTheDocument()
    })

    it('should show filtered game count for console', () => {
      const switchGames = mockGames.filter(game => game.platform === 'Nintendo Switch')
      const mockUseConsoleData = vi.mocked(hooks.useConsoleData)
      mockUseConsoleData.mockReturnValue({
        selectedConsole: { name: 'Nintendo Switch' },
        filteredGames: switchGames
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByText(`${switchGames.length} games`)).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should show pagination controls when pagination is enabled', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: mockGames,
        loading: false,
        paginationLoading: false,
        error: null,
        paginationEnabled: true,
        totalGames: 50,
        totalPages: 3
      })

      const mockUsePagination = vi.mocked(hooks.usePagination)
      mockUsePagination.mockReturnValue({
        currentPage: 2,
        pageSize: 20,
        totalPages: 3,
        totalItems: 50,
        handlePageChange: vi.fn(),
        handleNextPage: vi.fn(),
        handlePreviousPage: vi.fn(),
        setPaginationData: vi.fn(),
        resetToFirstPage: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      expect(screen.getByTestId('pagination-controls')).toBeInTheDocument()
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
      expect(screen.getByText('Showing 21-40 of 50 games')).toBeInTheDocument()
    })

    it('should show all games info when pagination is disabled', () => {
      const mockUseGamesData = vi.mocked(hooks.useGamesData)
      mockUseGamesData.mockReturnValue({
        games: mockGames,
        loading: false,
        paginationLoading: false,
        error: null,
        paginationEnabled: false,
        totalGames: mockGames.length,
        totalPages: 1
      })

      renderWithProviders(<MyCollection />)

      expect(screen.queryByTestId('pagination-controls')).not.toBeInTheDocument()
      expect(screen.getByText(`Showing all ${mockGames.length} games`)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to add game page when Add Game button is clicked', async () => {
      const mockNavigate = vi.fn()
      vi.doMock('react-router-dom', () => ({
        ...vi.importActual('react-router-dom'),
        useNavigate: () => mockNavigate,
        useParams: () => ({})
      }))

      renderWithProviders(<MyCollection />)

      const addGameButton = screen.getByRole('button', { name: /add game/i })
      await user.click(addGameButton)

      expect(mockNavigate).toHaveBeenCalledWith('/add-game')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for search input', () => {
      renderWithProviders(<MyCollection />)

      const searchInput = screen.getByPlaceholderText('Search your collection...')
      expect(searchInput).toHaveAttribute('aria-label', 'Search game collection')
    })

    it('should have proper ARIA labels for clear search button', () => {
      const mockUseCollectionSearch = vi.mocked(hooks.useCollectionSearch)
      mockUseCollectionSearch.mockReturnValue({
        searchValue: 'Zelda',
        debouncedSearchValue: 'Zelda',
        setSearchValue: vi.fn(),
        isSearchFieldFocused: false,
        setIsSearchFieldFocused: vi.fn()
      })

      renderWithProviders(<MyCollection />)

      const clearButton = screen.getByRole('button', { name: /clear search/i })
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search')
    })

    it('should be keyboard navigable', async () => {
      renderWithProviders(<MyCollection />)

      const searchInput = screen.getByPlaceholderText('Search your collection...')
      const listButton = screen.getByRole('button', { name: /list/i })
      const consoleButton = screen.getByRole('button', { name: /console/i })
      const addGameButton = screen.getByRole('button', { name: /add game/i })

      // Tab through interactive elements
      await user.tab()
      expect(searchInput).toHaveFocus()

      await user.tab()
      expect(listButton).toHaveFocus()

      await user.tab()
      expect(consoleButton).toHaveFocus()

      await user.tab()
      expect(addGameButton).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      renderWithProviders(<MyCollection />)

      // Should render responsive classes
      const header = screen.getByText('My Collection').closest('div')
      expect(header).toHaveClass('flex-col', 'lg:flex-row')
    })
  })
})