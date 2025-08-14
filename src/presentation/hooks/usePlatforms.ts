import { useState, useEffect, useMemo } from 'react';
import { createPlatformApiService } from '../../infrastructure/api';
import { useAuthService } from '../contexts/AuthContext';
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

  // Load platforms from API
  useEffect(() => {
    async function loadPlatforms() {
      if (!authService.isAuthenticated || authService.isLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const platformApiService = createPlatformApiService(authService);
        
        const platformsData = await platformApiService.getAllPlatforms();
        setPlatforms(platformsData);
        console.log('✅ Platforms loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load platforms:', err);
        setError(err instanceof Error ? err.message : 'Failed to load platforms');
      } finally {
        setLoading(false);
      }
    }

    loadPlatforms();
  }, [authService.isAuthenticated, authService.isLoading]);

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