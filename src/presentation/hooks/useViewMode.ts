import { useState, useEffect, useCallback } from 'react';

const COLLECTION_VIEW_KEY = 'gametrove_collection_view_mode';

export type ViewMode = 'list' | 'console';

export interface UseViewModeReturn {
  viewMode: ViewMode;
  updateViewMode: (mode: ViewMode) => void;
}

/**
 * Custom hook to manage collection view mode (list vs console)
 * Handles localStorage persistence and responsive behavior
 */
export function useViewMode(selectedConsole: boolean): UseViewModeReturn {
  // Get view mode from localStorage, default to 'list'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(COLLECTION_VIEW_KEY);
    return (saved === 'console' || saved === 'list') ? saved : 'list';
  });

  // Custom view mode setter that saves to localStorage
  const updateViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(COLLECTION_VIEW_KEY, mode);
  }, []);

  // Set view mode based on console selection and screen size
  useEffect(() => {
    if (selectedConsole) {
      // Always use list view when viewing a specific console
      setViewMode('list');
    } else {
      // For main collection page, force list view on mobile but respect saved preference on desktop
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setViewMode('list');
      }
      // On desktop, keep the saved preference (already loaded from localStorage)
    }
  }, [selectedConsole]);

  // Listen for window resize to adjust view mode
  useEffect(() => {
    const handleResize = () => {
      if (!selectedConsole) {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          // Force list view on mobile
          setViewMode('list');
        } else {
          // On desktop resize, restore saved preference
          const saved = localStorage.getItem(COLLECTION_VIEW_KEY);
          const preferredMode = (saved === 'console' || saved === 'list') ? saved : 'list';
          setViewMode(preferredMode);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConsole]);

  return {
    viewMode,
    updateViewMode,
  };
}
