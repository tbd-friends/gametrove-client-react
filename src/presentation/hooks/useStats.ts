import { useState, useEffect } from 'react';
import { createStatsApiService } from '../../infrastructure/api';
import { useAuthService } from '../contexts/AuthContext';
import type { CollectionStats } from '../../domain/models';

export interface UseStatsReturn {
  stats: CollectionStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authService = useAuthService();

  const fetchStats = async () => {
    if (!authService.isAuthenticated || authService.isLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const statsApiService = createStatsApiService(authService);
      
      console.log('📊 Fetching collection stats...');
      const collectionStats = await statsApiService.getStats();
      
      setStats(collectionStats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collection stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [authService.isAuthenticated, authService.isLoading]);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
}