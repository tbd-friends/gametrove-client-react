import { useState, useCallback } from 'react';
import { createIgdbApiService } from '../../infrastructure/api';
import { useAuthService } from './useAuthService';
import type { IgdbGame } from '../../domain/models';

export interface UseIgdbSearchReturn {
  results: IgdbGame[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchGames: (term: string, platformId: number) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for searching games using the IGDB API
 */
export function useIgdbSearch(): UseIgdbSearchReturn {
  const [results, setResults] = useState<IgdbGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const authService = useAuthService();

  const searchGames = useCallback(async (term: string, platformId: number) => {
    if (!authService.isAuthenticated || authService.isLoading) {
      setError('Authentication required for search');
      return;
    }

    if (!term.trim() || !platformId) {
      setError('Both game title and platform are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(false);
      
      const igdbApiService = createIgdbApiService(authService);
      const searchResults = await igdbApiService.searchGames(term, platformId);
      
      setResults(searchResults);
      setHasSearched(true);
      console.log(`✅ IGDB search completed: ${searchResults.length} results found`);
    } catch (err) {
      console.error('❌ IGDB search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [authService]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    hasSearched,
    searchGames,
    clearResults
  };
}