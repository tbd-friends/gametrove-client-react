/**
 * Represents a physical copy of a game in a user's collection
 */
export interface GameCopy {
  /** Unique identifier for this copy */
  id: string;
  
  /** API URL endpoint for this copy */
  url: string;
  
  /** User's description/notes for this copy */
  description: string;
  
  /** Purchase cost (can be null if unknown) */
  cost: number | null;
  
  /** Date when this copy was purchased */
  purchasedDate: string; // ISO 8601 date string
  
  /** Date when this record was last updated */
  updatedDate: string; // ISO 8601 date string
  
  /** Current market price for complete-in-box condition */
  completeInBoxPrice: number;
  
  /** Current market price for loose/cart-only condition */
  loosePrice: number;
  
  /** Current market price for new/sealed condition */
  newPrice: number;
  
  /** Estimated current value of this specific copy */
  estimatedValue: number;
  
  /** Physical condition of this copy */
  condition: GameCondition;
  
  /** UPC barcode of this copy */
  upc: string;
}

/**
 * Standardized condition types for game copies
 */
export const GameCondition = {
  NEW: "New",
  COMPLETE_IN_BOX: "Complete In Box",
  COMPLETE: "Complete", // API compatibility
  CART_ONLY: "Cart Only", 
  LOOSE: "Loose",
  POOR: "Poor"
} as const;

export type GameCondition = typeof GameCondition[keyof typeof GameCondition];

/**
 * Maps API condition strings to our standardized conditions
 */
export function mapApiConditionToGameCondition(apiCondition: string): GameCondition {
  // Direct mapping for exact matches
  if (Object.values(GameCondition).includes(apiCondition as GameCondition)) {
    return apiCondition as GameCondition;
  }
  
  // Fallback mappings for API variations
  switch (apiCondition.toLowerCase()) {
    case 'complete':
    case 'complete in box':
    case 'cib':
      return GameCondition.COMPLETE;
    case 'new':
    case 'sealed':
    case 'mint':
      return GameCondition.NEW;
    case 'cart only':
    case 'cartridge only':
    case 'loose':
      return GameCondition.LOOSE;
    case 'poor':
    case 'damaged':
      return GameCondition.POOR;
    default:
      // Default to COMPLETE for unknown conditions
      return GameCondition.COMPLETE;
  }
}

/**
 * Pricing information for a game across different conditions
 */
export interface GamePricing {
  completeInBoxPrice: number;
  loosePrice: number;
  newPrice: number;
}