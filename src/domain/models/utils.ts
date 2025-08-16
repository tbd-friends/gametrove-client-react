import type { Game, GameCollectionSummary } from './Game';
import type { GameCopy } from './GameCopy';
import { GameCondition } from './GameCopy';
import type { CollectionStats, PlatformStats } from './Collection';
import type { Platform } from './Platform';

/**
 * Utility functions for working with domain models
 */

/**
 * Calculates the total value of all copies of a game
 */
export function calculateGameTotalValue(game: Game): number {
  return game.copies.reduce((total, copy) => total + (copy.currentMarketPrice || copy.cost || 0), 0);
}

/**
 * Gets the best condition copy of a game
 */
export function getBestConditionCopy(game: Game): GameCopy | undefined {
  const conditionOrder = [
    GameCondition.MINT,
    GameCondition.NEAR_MINT,
    GameCondition.EXCELLENT,
    GameCondition.VERY_GOOD,
    GameCondition.GOOD,
    GameCondition.FAIR,
    GameCondition.POOR
  ];

  return game.copies
    .slice()
    .sort((a, b) => conditionOrder.indexOf(a.condition) - conditionOrder.indexOf(b.condition))[0];
}

/**
 * Gets the most valuable copy of a game
 */
export function getMostValuableCopy(game: Game): GameCopy | undefined {
  return game.copies
    .slice()
    .sort((a, b) => (b.currentMarketPrice || 0) - (a.currentMarketPrice || 0))[0];
}

/**
 * Calculates average condition for a game's copies
 */
export function calculateAverageCondition(copies: GameCopy[]): string {
  if (copies.length === 0) return 'Unknown';

  const conditionValues = {
    [GameCondition.MINT]: 10,
    [GameCondition.NEAR_MINT]: 9,
    [GameCondition.EXCELLENT]: 8,
    [GameCondition.VERY_GOOD]: 7,
    [GameCondition.GOOD]: 6,
    [GameCondition.FAIR]: 4,
    [GameCondition.POOR]: 2
  };

  const total = copies.reduce((sum, copy) => sum + conditionValues[copy.condition], 0);
  const average = total / copies.length;

  // Convert back to condition
  if (average >= 9.5) return GameCondition.MINT;
  if (average >= 8.5) return GameCondition.NEAR_MINT;
  if (average >= 7.5) return GameCondition.EXCELLENT;
  if (average >= 6.5) return GameCondition.VERY_GOOD;
  if (average >= 5.5) return GameCondition.GOOD;
  if (average >= 3) return GameCondition.FAIR;
  return GameCondition.POOR;
}

/**
 * Creates a game collection summary from a game
 */
export function createGameCollectionSummary(game: Game): GameCollectionSummary {
  const sortedByDate = game.copies
    .slice()
    .sort((a, b) => new Date(a.purchasedDate || '').getTime() - new Date(b.purchasedDate || '').getTime());

  return {
    totalCopies: game.copies.length,
    totalValue: calculateGameTotalValue(game),
    averageCondition: calculateAverageCondition(game.copies),
    firstAddedDate: sortedByDate[0]?.purchasedDate || new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString()
  };
}

/**
 * Calculates statistics for games grouped by platform
 */
export function calculatePlatformStats(games: Game[]): PlatformStats[] {
  const platformMap = new Map<string, {
    platform: Platform;
    games: Game[];
    copies: GameCopy[];
  }>();

  // Group games and copies by platform
  games.forEach(game => {
    const platformId = game.platform.id;
    if (!platformMap.has(platformId)) {
      platformMap.set(platformId, {
        platform: game.platform,
        games: [],
        copies: []
      });
    }
    const entry = platformMap.get(platformId)!;
    entry.games.push(game);
    entry.copies.push(...game.copies);
  });

  // Calculate stats for each platform
  return Array.from(platformMap.values()).map(({ platform, games, copies }) => {
    const totalValue = copies.reduce((sum, copy) => sum + (copy.currentMarketPrice || copy.cost || 0), 0);
    
    return {
      platform,
      gameCount: games.length,
      copyCount: copies.length,
      totalValue,
      averageValue: copies.length > 0 ? totalValue / copies.length : 0
    };
  });
}

/**
 * Calculates collection statistics from games array
 */
export function calculateCollectionStats(games: Game[]): Omit<CollectionStats, 'mostValuableGame' | 'recentlyAdded' | 'wishlistCount'> {
  const allCopies = games.flatMap(game => game.copies);
  const totalValue = allCopies.reduce((sum, copy) => sum + (copy.currentMarketPrice || copy.cost || 0), 0);
  const platformStats = calculatePlatformStats(games);

  return {
    totalGames: games.length,
    totalCopies: allCopies.length,
    totalValue,
    platformCount: platformStats.length,
    platformStats
  };
}

/**
 * Formats a price with currency symbol
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  return new Date(dateString).toLocaleDateString(locale);
}

/**
 * Creates a URL-safe slug from a string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Filters games by search term
 */
export function searchGames(games: Game[], searchTerm: string): Game[] {
  if (!searchTerm.trim()) return games;

  const term = searchTerm.toLowerCase();
  return games.filter(game => 
    game.description.toLowerCase().includes(term) ||
    game.platform.description.toLowerCase().includes(term) ||
    game.publisher.description.toLowerCase().includes(term)
  );
}

/**
 * Sorts games by various criteria
 */
export function sortGames(games: Game[], sortBy: 'name' | 'platform' | 'value' | 'date'): Game[] {
  return games.slice().sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.description.localeCompare(b.description);
      case 'platform':
        return a.platform.description.localeCompare(b.platform.description);
      case 'value':
        return calculateGameTotalValue(b) - calculateGameTotalValue(a);
      case 'date': {
        const aDate = Math.max(...a.copies.map(c => new Date(c.purchasedDate || '').getTime()));
        const bDate = Math.max(...b.copies.map(c => new Date(c.purchasedDate || '').getTime()));
        return bDate - aDate;
      }
      default:
        return 0;
    }
  });
}