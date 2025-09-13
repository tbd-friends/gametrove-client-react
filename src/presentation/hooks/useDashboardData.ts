import { useState, useEffect } from 'react';
import type { Game } from '../../domain/models';
import type { PriceChartingHighlight } from '../../infrastructure/api';
import type { StatsData } from '../components/dashboard/StatsCards';
import { createPriceChartingApiService, createGameApiService } from '../../infrastructure/api';
import { useAuthService } from './useAuthService';
import { usePriceCharting } from './index';
import { logger } from '../../shared/utils/logger';

export interface DashboardData {
  // Stats
  stats: StatsData;
  statsLoading: boolean;
  statsError: string | null;
  
  // Price highlights
  highlights: PriceChartingHighlight[];
  highlightsLoading: boolean;
  highlightsError: string | null;
  
  // Recent games
  recentGames: Game[];
  recentGamesLoading: boolean;
  recentGamesError: string | null;
  
  // Computed state
  isPriceChartingEnabled: boolean;
}

export const useDashboardData = (): DashboardData => {
  const authService = useAuthService();
  const { isEnabled: isPriceChartingEnabled } = usePriceCharting();

  // Stats state
  const [stats, setStats] = useState<StatsData>({
    totalGames: 0,
    totalCopies: 0,
    platforms: 0,
    publishers: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Price highlights state
  const [highlights, setHighlights] = useState<PriceChartingHighlight[]>([]);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlightsError, setHighlightsError] = useState<string | null>(null);

  // Recent games state
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [recentGamesLoading, setRecentGamesLoading] = useState(false);
  const [recentGamesError, setRecentGamesError] = useState<string | null>(null);

  // Load collection stats
  useEffect(() => {
    async function loadStats() {
      if (!authService.isAuthenticated || authService.isLoading) {
        return;
      }

      try {
        setStatsLoading(true);
        setStatsError(null);

        // TODO: Replace with actual API call when StatsApiService is implemented
        // const statsApiService = createStatsApiService(authService);
        // const statsData = await statsApiService.getCollectionStats();
        
        // For now, simulate loading and use placeholder data
        await new Promise(resolve => setTimeout(resolve, 500));
        const newStats = {
          totalGames: 247,
          totalCopies: 312,
          platforms: 12,
          publishers: 89
        };
        
        setStats(newStats);
        logger.debug('Loaded collection stats', { stats: newStats }, 'DASHBOARD');
      } catch (err) {
        logger.error('Failed to load collection stats', err instanceof Error ? err.message : err, 'DASHBOARD');
        setStatsError(err instanceof Error ? err.message : 'Failed to load collection stats');
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [authService.isAuthenticated, authService.isLoading]);

  // Load price highlights when PriceCharting is enabled
  useEffect(() => {
    async function loadHighlights() {
      if (!isPriceChartingEnabled || !authService.isAuthenticated || authService.isLoading) {
        return;
      }

      try {
        setHighlightsLoading(true);
        setHighlightsError(null);

        const priceChartingApiService = createPriceChartingApiService(authService);
        const highlightsData = await priceChartingApiService.getHighlights();

        setHighlights(highlightsData);
        logger.debug('Loaded price highlights', { count: highlightsData.length }, 'DASHBOARD');
      } catch (err) {
        logger.error('Failed to load price highlights', err instanceof Error ? err.message : err, 'DASHBOARD');
        setHighlightsError(err instanceof Error ? err.message : 'Failed to load price highlights');
      } finally {
        setHighlightsLoading(false);
      }
    }

    loadHighlights();
  }, [isPriceChartingEnabled, authService.isAuthenticated, authService.isLoading]);

  // Load recent games
  useEffect(() => {
    async function loadRecentGames() {
      if (!authService.isAuthenticated || authService.isLoading) {
        return;
      }

      try {
        setRecentGamesLoading(true);
        setRecentGamesError(null);

        const gameApiService = createGameApiService(authService);
        const recentGamesData = await gameApiService.getRecentGames();

        setRecentGames(recentGamesData);
        logger.debug('Loaded recent games', { count: recentGamesData.length }, 'DASHBOARD');
      } catch (err) {
        logger.error('Failed to load recent games', err instanceof Error ? err.message : err, 'DASHBOARD');
        setRecentGamesError(err instanceof Error ? err.message : 'Failed to load recent games');
      } finally {
        setRecentGamesLoading(false);
      }
    }

    loadRecentGames();
  }, [authService.isAuthenticated, authService.isLoading]);

  return {
    stats,
    statsLoading,
    statsError,
    highlights,
    highlightsLoading,
    highlightsError,
    recentGames,
    recentGamesLoading,
    recentGamesError,
    isPriceChartingEnabled,
  };
};