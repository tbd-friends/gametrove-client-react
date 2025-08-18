import type { GameCollection } from './Collection';

/**
 * User account information
 */
export interface User {
  /** Unique user identifier */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** User's display name */
  username: string;
  
  /** User's full name */
  fullName?: string;
  
  /** Profile avatar URL */
  avatarUrl?: string;
  
  /** User's preferred timezone */
  timezone?: string;
  
  /** User's preferred language */
  language: string;
  
  /** Account creation date */
  createdDate: string;
  
  /** Last login date */
  lastLoginDate?: string;
  
  /** Whether email is verified */
  isEmailVerified: boolean;
  
  /** Account status */
  status: UserStatus;
  
  /** User's collections */
  collections: GameCollection[];
  
  /** User preferences */
  preferences: UserPreferences;
}

/**
 * User account status
 */
export const UserStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  PENDING_VERIFICATION: "pending_verification",
  DELETED: "deleted"
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

/**
 * User preferences and settings
 */
export interface UserPreferences {
  /** Default currency for pricing */
  defaultCurrency: string;
  
  /** Email notification settings */
  emailNotifications: NotificationSettings;
  
  /** Privacy settings */
  privacy: PrivacySettings;
  
  /** Display preferences */
  display: DisplayPreferences;
}

/**
 * Email notification preferences
 */
export interface NotificationSettings {
  /** Price change alerts */
  priceAlerts: boolean;
  
  /** New game releases */
  newReleases: boolean;
  
  /** Collection milestones */
  collectionMilestones: boolean;
  
  /** Weekly/monthly summaries */
  summaries: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  /** Profile visibility */
  profileVisibility: ProfileVisibility;
  
  /** Collection visibility */
  defaultCollectionVisibility: CollectionVisibility;
  
  /** Allow friend requests */
  allowFriendRequests: boolean;
}

/**
 * Profile visibility levels
 */
export const ProfileVisibility = {
  PUBLIC: "public",
  FRIENDS: "friends",
  PRIVATE: "private"
} as const;

export type ProfileVisibility = typeof ProfileVisibility[keyof typeof ProfileVisibility];

/**
 * Collection visibility levels  
 */
export const CollectionVisibility = {
  PUBLIC: "public",
  FRIENDS: "friends", 
  PRIVATE: "private"
} as const;

export type CollectionVisibility = typeof CollectionVisibility[keyof typeof CollectionVisibility];

/**
 * Display preferences
 */
export interface DisplayPreferences {
  /** Preferred date format */
  dateFormat: string;
  
  /** Preferred number format */
  numberFormat: string;
  
  /** Theme preference */
  theme: Theme;
  
  /** Items per page */
  itemsPerPage: number;
}

/**
 * Theme options
 */
export const Theme = {
  LIGHT: "light",
  DARK: "dark", 
  AUTO: "auto"
} as const;

export type Theme = typeof Theme[keyof typeof Theme];