/**
 * Represents a gaming platform/console from the API
 */
export interface Platform {
  /** Unique identifier for this platform */
  id: string;
  
  /** API URL endpoint for this platform */
  url: string;
  
  /** Display name of the platform */
  description: string;
  
  /** Manufacturer of the platform (e.g., "Nintendo", "Sony", "Microsoft") */
  manufacturer: string;
}

/**
 * Extended platform information with additional metadata
 */
export interface PlatformDetails extends Platform {
  /** Full official name of the platform */
  name: string;
  
  /** Manufacturer of the platform */
  manufacturer: string;
  
  /** Release year of the platform */
  releaseYear: number;
  
  /** Whether this platform is still active/supported */
  isActive: boolean;
  
  /** Platform generation (e.g., "8th Generation") */
  generation?: string;
  
  /** Platform type (e.g., "Console", "Handheld", "PC") */
  type: PlatformType;
}

/**
 * Types of gaming platforms
 */
export const PlatformType = {
  CONSOLE: "Console",
  HANDHELD: "Handheld", 
  PC: "PC",
  MOBILE: "Mobile",
  ARCADE: "Arcade"
} as const;

export type PlatformType = typeof PlatformType[keyof typeof PlatformType];