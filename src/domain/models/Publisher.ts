/**
 * Represents a game publisher/developer company
 */
export interface Publisher {
  /** Unique identifier for this publisher */
  id: string;
  
  /** API URL endpoint for this publisher */
  url: string;
  
  /** Display name of the publisher */
  description: string;
}

/**
 * Extended publisher information with additional metadata
 */
export interface PublisherDetails extends Publisher {
  /** Full official name of the publisher */
  name: string;
  
  /** Country where the publisher is based */
  country?: string;
  
  /** Year the publisher was founded */
  foundedYear?: number;
  
  /** Whether the publisher is still active */
  isActive: boolean;
  
  /** Type of company (Publisher, Developer, Both) */
  type: PublisherType;
  
  /** Website URL */
  website?: string;
}

/**
 * Types of game companies
 */
export const PublisherType = {
  PUBLISHER: "Publisher",
  DEVELOPER: "Developer", 
  BOTH: "Publisher & Developer",
  INDIE: "Independent"
} as const;

export type PublisherType = typeof PublisherType[keyof typeof PublisherType];