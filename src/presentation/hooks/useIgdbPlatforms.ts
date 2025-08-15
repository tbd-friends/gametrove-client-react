import { useState, useEffect, useMemo } from 'react';
import { createIgdbApiService } from '../../infrastructure/api/IgdbApiService';
import { useAuthService } from '../contexts/AuthContext';
import type { IgdbPlatform } from '../../domain/models/IgdbGame';

export interface UseIgdbPlatformsReturn {
  platforms: IgdbPlatform[];
  loading: boolean;
  error: string | null;
  searchPlatforms: (query: string) => IgdbPlatform[];
  reloadPlatforms: () => Promise<void>;
}

/**
 * Hook for fetching and managing IGDB platforms data with client-side caching
 */
export function useIgdbPlatforms(): UseIgdbPlatformsReturn {
  const [platforms, setPlatforms] = useState<IgdbPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = useAuthService();

  // Create API service instance
  const igdbApiService = useMemo(() => 
    authService.isAuthenticated ? createIgdbApiService(authService) : null, 
    [authService.isAuthenticated]
  );

  // Load IGDB platforms from API (with built-in caching)
  const loadIgdbPlatforms = useMemo(() => {
    return async () => {
      if (!igdbApiService || authService.isLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const platformsData = await igdbApiService.getPlatforms();
        setPlatforms(platformsData);
        console.log('✅ IGDB platforms loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load IGDB platforms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load IGDB platforms');
      } finally {
        setLoading(false);
      }
    };
  }, [igdbApiService, authService.isLoading]);

  // Load platforms on mount and when auth state changes
  useEffect(() => {
    loadIgdbPlatforms();
  }, [loadIgdbPlatforms]);

  // Reload platforms function (clears cache and refetches)
  const reloadPlatforms = useMemo(() => {
    return async () => {
      if (!igdbApiService) {
        return;
      }

      try {
        console.log('🔄 Reloading IGDB platforms (clearing cache)');
        igdbApiService.clearPlatformsCache();
        await loadIgdbPlatforms();
      } catch (err) {
        console.error('❌ Failed to reload IGDB platforms:', err);
        setError(err instanceof Error ? err.message : 'Failed to reload IGDB platforms');
      }
    };
  }, [igdbApiService, loadIgdbPlatforms]);

  // Memoized search function for filtering IGDB platforms
  const searchPlatforms = useMemo(() => {
    return (query: string): IgdbPlatform[] => {
      if (!query.trim()) {
        return platforms;
      }

      const searchTerm = query.toLowerCase();
      return platforms.filter(platform => 
        platform.name.toLowerCase().includes(searchTerm) ||
        platform.abbreviation?.toLowerCase().includes(searchTerm) ||
        platform.alternativeName?.toLowerCase().includes(searchTerm)
      );
    };
  }, [platforms]);

  return {
    platforms,
    loading,
    error,
    searchPlatforms,
    reloadPlatforms
  };
}