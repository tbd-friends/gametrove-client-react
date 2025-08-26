import { useState, useEffect, useMemo, useRef } from 'react';
import { createPlatformApiService } from '../../infrastructure/api';
import { useAuthService } from './useAuthService';
import type { Platform } from '../../domain/models';

export interface UsePlatformsReturn {
  platforms: Platform[];
  loading: boolean;
  error: string | null;
  searchPlatforms: (query: string) => Platform[];
}

/**
 * Hook for fetching and managing platforms data
 */
export function usePlatforms(): UsePlatformsReturn {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = useAuthService();
  const hasFetched = useRef(false);

  // Load platforms from API
  useEffect(() => {
    async function loadPlatforms() {
      // Only load if authenticated and haven't already fetched
      if (!authService.isAuthenticated || authService.isLoading || hasFetched.current) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        hasFetched.current = true;
        const platformApiService = createPlatformApiService(authService);
        
        const platformsData = await platformApiService.getAllPlatforms();
        setPlatforms(platformsData);
        console.log('✅ Platforms loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load platforms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load platforms');
        // Reset flag on error so we can retry
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    }

    loadPlatforms();
  }, [authService.isAuthenticated]);

  // Memoized search function for filtering platforms
  const searchPlatforms = useMemo(() => {
    return (query: string): Platform[] => {
      if (!query.trim()) {
        return platforms;
      }

      const searchTerm = query.toLowerCase();
      return platforms.filter(platform => 
        platform.description.toLowerCase().includes(searchTerm) ||
        platform.manufacturer.toLowerCase().includes(searchTerm)
      );
    };
  }, [platforms]);

  return {
    platforms,
    loading,
    error,
    searchPlatforms
  };
}