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
  CART_ONLY: "Cart Only", 
  LOOSE: "Loose",
  POOR: "Poor"
} as const;

export type GameCondition = typeof GameCondition[keyof typeof GameCondition];

/**
 * Pricing information for a game across different conditions
 */
export interface GamePricing {
  completeInBoxPrice: number;
  loosePrice: number;
  newPrice: number;
}