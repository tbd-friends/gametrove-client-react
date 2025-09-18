import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { consoleNameToSlug } from '../utils/slugUtils';
import type { Game } from '../../domain/models';

export interface Console {
  name: string;
  company: string;
  gameCount: number;
  color: string;
  icon: string;
}

export interface UseConsoleDataReturn {
  consoles: Console[];
  selectedConsole: Console | null;
  getPlatformColor: (platformName: string) => string;
  filteredGames: Game[];
}

/**
 * Custom hook to manage console data and filtering logic
 * Handles platform color mapping, console grouping, and game filtering
 */
export function useConsoleData(games: Game[], debouncedSearchValue: string): UseConsoleDataReturn {
  const { consoleName } = useParams<{ consoleName?: string }>();

  // Calculate platform colors
  const platformColorMap: Record<string, string> = {
    'PlayStation': 'bg-blue-600',
    'Xbox': 'bg-green-600',
    'Nintendo': 'bg-red-600',
    'PC': 'bg-purple-600',
    'Steam': 'bg-orange-600'
  };

  const getPlatformColor = useCallback((platformName: string): string => {
    for (const [key, color] of Object.entries(platformColorMap)) {
      if (platformName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return 'bg-gray-600';
  }, []);

  // Calculate console data from real games
  const consoles = useMemo(() => {
    const platformGroups = games.reduce((acc, game) => {
      const platformName = game.platform.description;
      if (!acc[platformName]) {
        acc[platformName] = {
          name: platformName,
          company: "Various Publishers",
          gameCount: 0,
          color: getPlatformColor(platformName),
          icon: platformName.toLowerCase().includes('pc') || platformName.toLowerCase().includes('steam') ? "💻" : "🎮"
        };
      }
      acc[platformName].gameCount += 1;
      return acc;
    }, {} as Record<string, Console>);

    return Object.values(platformGroups).sort((a, b) => b.gameCount - a.gameCount);
  }, [games, getPlatformColor]);

  // Find selected console from URL parameter
  const selectedConsole = consoleName
    ? consoles.find(c => consoleNameToSlug(c.name) === consoleName.toLowerCase()) || null
    : null;

  // Filter games based on selected console only
  // Note: Search filtering is handled server-side by the API via searchTerm parameter
  const filteredGames = useMemo(() => {
    let filtered = games;

    // Only filter by selected console - search is handled by the API
    if (selectedConsole) {
      filtered = filtered.filter(game => game.platform.description === selectedConsole.name);
    }

    return filtered;
  }, [games, selectedConsole]);

  return {
    consoles,
    selectedConsole,
    getPlatformColor,
    filteredGames,
  };
}
