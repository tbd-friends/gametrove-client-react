import type {GameCopy} from './GameCopy';
import type {Platform} from './Platform';
import type {Publisher} from './Publisher';

/**
 * Represents a game with its associated data
 * Based on the API response structure from temp_games_request.json
 */
export interface Game {
    /** Unique identifier for this game */
    id: string;

    /** API URL endpoint for this game */
    url: string;

    /** Display name/title of the game */
    description: string;

    /** Number of copies owned of this game */
    copyCount: number;

    /** Platform this game is for */
    platform: Platform;

    /** Publisher of this game */
    publisher: Publisher | null;

    /** Array of physical copies in user's collection */
    copies: GameCopy[] | null;

    /** IGDB game ID if linked to IGDB */
    igdbGameId?: number | null;
}

/**
 * Extended game information with additional metadata
 */
export interface GameDetails extends Game {
    /** Full official title of the game */
    title: string;

    /** Release date of the game */
    releaseDate?: string;

    /** Game genres */
    genres: string[];

    /** ESRB rating */
    esrbRating?: string;

    /** Game synopsis/description */
    synopsis?: string;

    /** Cover image URL */
    coverImageUrl?: string;

    /** Screenshots */
    screenshots: GameScreenshot[];

    /** Developer (may differ from publisher) */
    developer?: Publisher;

    /** IGDB ID for external reference */
    igdbId?: number;

    /** User's personal rating (1-10) */
    userRating?: number;

    /** User's personal notes */
    userNotes?: string;

    /** Whether this game is in user's wishlist */
    isWishlisted: boolean;

    /** Tags assigned by the user */
    userTags: string[];
}

/**
 * Screenshot information for a game
 */
export interface GameScreenshot {
    id: string;
    url: string;
    title?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
}

/**
 * Summary statistics for a game in collection
 */
export interface GameCollectionSummary {
    /** Total number of copies owned */
    totalCopies: number;

    /** Total estimated value of all copies */
    totalValue: number;

    /** Average condition of copies */
    averageCondition: string;

    /** Date first added to collection */
    firstAddedDate: string;

    /** Date last updated */
    lastUpdatedDate: string;
}