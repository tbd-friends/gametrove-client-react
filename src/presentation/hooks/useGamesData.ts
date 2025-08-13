import { useState, useEffect } from 'react';
import { createGameApiService } from '../../infrastructure/api';
import { useAuthService } from '../contexts/AuthContext';
import type { Game } from '../../domain/models';

export interface UseGamesDataProps {
  viewMode: 'list' | 'console';
  currentPage: number;
  pageSize: number;
  hasSelectedConsole: boolean;
  searchTerm?: string;
}

export interface UseGamesDataReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalGames: number;
  paginationEnabled: boolean;
  updatePagination?: (data: { totalPages: number; totalItems: number; enabled: boolean }) => void;
}

export function useGamesData({
  viewMode,
  currentPage,
  pageSize,
  hasSelectedConsole,
  searchTerm
}: UseGamesDataProps): UseGamesDataReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [allGamesCache, setAllGamesCache] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [paginationEnabled, setPaginationEnabled] = useState(false);

  const authService = useAuthService();

  // Effect for CONSOLE VIEW - Load all games once and cache them
  useEffect(() => {
    async function loadGamesForConsoleView() {
      if (!authService.isAuthenticated || authService.isLoading) {
        return;
      }

      // Only for console view or console-specific view
      if (viewMode !== 'console' && !hasSelectedConsole) {
        return;
      }

      // If we already have cached games, use them
      if (allGamesCache.length > 0) {
        console.log('🏠 Using cached games for console view');
        setGames(allGamesCache);
        setLoading(false);
        setPaginationEnabled(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const gameApiService = createGameApiService(authService);
        
        console.log('🏠 Loading all games for console view (one-time only)');
        const result = await gameApiService.getAllGames(); // No pagination parameters
        const loadedGames = Array.isArray(result) ? result : result.games;
        
        setAllGamesCache(loadedGames); // Cache for future use
        setGames(loadedGames);
        setPaginationEnabled(false);
      } catch (err) {
        console.error('Failed to load games for console view:', err);
        setError(err instanceof Error ? err.message : 'Failed to load games');
      } finally {
        setLoading(false);
      }
    }

    loadGamesForConsoleView();
  }, [authService.isAuthenticated, authService.isLoading, viewMode, hasSelectedConsole, allGamesCache.length]);

  // Effect for LIST VIEW - Make paginated API calls
  useEffect(() => {
    async function loadGamesForListView() {
      if (!authService.isAuthenticated) {
        return;
      }

      // Only for list view (not console view or console-specific view)
      if (viewMode !== 'list' || hasSelectedConsole) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const gameApiService = createGameApiService(authService);
        
        const paginationParams = {
          page: currentPage,
          limit: pageSize,
          search: searchTerm
        };

        console.log('📋 Making paginated API request:', `/api/games?page=${currentPage}&limit=${pageSize}${searchTerm ? `&search=${searchTerm}` : ''}`);
        const result = await gameApiService.getAllGames(paginationParams);

        if ('games' in result) {
          // Paginated result
          setGames(result.games);
          setTotalPages(result.totalPages);
          setTotalGames(result.total);
          setPaginationEnabled(true);
        } else {
          // Non-paginated result (fallback)
          setGames(result);
          setPaginationEnabled(false);
        }
      } catch (err) {
        console.error('Failed to load paginated games:', err);
        setError(err instanceof Error ? err.message : 'Failed to load games');
      } finally {
        setLoading(false);
      }
    }

    loadGamesForListView();
  }, [viewMode, currentPage, pageSize, hasSelectedConsole, searchTerm, authService.isAuthenticated]);

  return {
    games,
    loading,
    error,
    totalPages,
    totalGames,
    paginationEnabled
  };
}