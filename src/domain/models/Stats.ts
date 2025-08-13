/**
 * Collection statistics response from the API
 */
export interface CollectionStats {
  /** Total number of games in the collection */
  gameCount: number;
  
  /** Total number of copies across all games */
  copiesCount: number;
  
  /** Total number of platforms/consoles with games */
  platformsCount: number;
  
  /** Total number of consoles being tracked */
  consolesCount: number;
  
  /** Total number of games on wishlist */
  wishlisted: number;
}

/**
 * Stats with loading and error state for UI components
 */
export interface StatsState {
  stats: CollectionStats | null;
  loading: boolean;
  error: string | null;
}