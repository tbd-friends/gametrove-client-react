import { useState, useEffect, useMemo, useRef } from 'react';
import { createPublisherApiService } from '../../infrastructure/api';
import { useAuthService } from './useAuthService';
import type { Publisher } from '../../domain/models';

export interface UsePublishersReturn {
  publishers: Publisher[];
  loading: boolean;
  error: string | null;
  searchPublishers: (query: string) => Publisher[];
}

/**
 * Hook for fetching and managing publishers data
 */
export function usePublishers(): UsePublishersReturn {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = useAuthService();
  const hasFetched = useRef(false);

  // Load publishers from API
  useEffect(() => {
    async function loadPublishers() {
      // Only load if authenticated and haven't already fetched
      if (!authService.isAuthenticated || authService.isLoading || hasFetched.current) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        hasFetched.current = true;
        const publisherApiService = createPublisherApiService(authService);
        
        const publishersData = await publisherApiService.getAllPublishers();
        setPublishers(publishersData);
        console.log('✅ Publishers loaded successfully');
      } catch (err) {
        console.error('❌ Failed to load publishers:', err);
        setError(err instanceof Error ? err.message : 'Failed to load publishers');
        // Reset flag on error so we can retry
        hasFetched.current = false;
      } finally {
        setLoading(false);
      }
    }

    loadPublishers();
  }, [authService.isAuthenticated, authService]);

  // Memoized search function for filtering publishers
  const searchPublishers = useMemo(() => {
    return (query: string): Publisher[] => {
      if (!query.trim()) {
        return publishers;
      }

      const searchTerm = query.toLowerCase();
      return publishers.filter(publisher => 
        publisher.description.toLowerCase().includes(searchTerm)
      );
    };
  }, [publishers]);

  return {
    publishers,
    loading,
    error,
    searchPublishers
  };
}