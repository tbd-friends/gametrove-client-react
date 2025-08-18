import type {Game} from './Game';
import type {Platform} from './Platform';
import type {CollectionStats} from "./Stats.ts";

/**
 * User's game collection data
 */
export interface GameCollection {
    /** Unique identifier for the collection */
    id: string;

    /** User ID who owns this collection */
    userId: string;

    /** Collection name/title */
    name: string;

    /** Collection description */
    description?: string;

    /** Games in this collection */
    games: Game[];

    /** Collection statistics */
    stats: CollectionStats;

    /** Collection settings */
    settings: CollectionSettings;

    /** Date collection was created */
    createdDate: string;

    /** Date collection was last updated */
    updatedDate: string;
}

/**
 * Statistics for a specific platform in collection
 */
export interface PlatformStats {
    platform: Platform;
    gameCount: number;
    copyCount: number;
    totalValue: number;
    averageValue: number;
}

/**
 * User's collection preferences and settings
 */
export interface CollectionSettings {
    /** Privacy level */
    privacy: CollectionPrivacy;

    /** Default currency for pricing */
    currency: string;

    /** Whether to automatically update pricing */
    autoUpdatePricing: boolean;

    /** Preferred condition for value estimates */
    defaultCondition: string;

    /** Custom fields enabled */
    customFields: CustomField[];
}

/**
 * Collection privacy levels
 */
export const CollectionPrivacy = {
    PRIVATE: "private",
    FRIENDS: "friends",
    PUBLIC: "public"
} as const;

export type CollectionPrivacy = typeof CollectionPrivacy[keyof typeof CollectionPrivacy];

/**
 * Custom field definition for collections
 */
export interface CustomField {
    id: string;
    name: string;
    type: CustomFieldType;
    required: boolean;
    options?: string[]; // For select/multi-select types
}

/**
 * Types of custom fields
 */
export const CustomFieldType = {
    TEXT: "text",
    NUMBER: "number",
    DATE: "date",
    SELECT: "select",
    MULTI_SELECT: "multi_select",
    BOOLEAN: "boolean"
} as const;

export type CustomFieldType = typeof CustomFieldType[keyof typeof CustomFieldType];