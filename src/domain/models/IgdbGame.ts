/**
 * IGDB game search result interface matching the API response structure
 */
export interface IgdbGame {
    /** IGDB unique identifier */
    id: number;
    
    /** Game title/name */
    name: string;
    
    /** Game description/summary */
    summary?: string;
    
    /** Available platforms for this game */
    platforms?: IgdbPlatform[];
    
    /** Game genres */
    genres?: IgdbGenre[];
    
    /** Game themes */
    themes?: IgdbTheme[];
}

/**
 * Platform information from IGDB
 */
export interface IgdbPlatform {
    /** IGDB platform ID */
    id: number;
    
    /** Platform name */
    name: string;
    
    /** Platform abbreviation/short name */
    abbreviation?: string;
    
    /** Alternative platform name */
    alternativeName?: string;
}

/**
 * Genre information from IGDB
 */
export interface IgdbGenre {
    name: string;
}

/**
 * Theme information from IGDB
 */
export interface IgdbTheme {
    name: string;
}

/**
 * Utility functions for working with IGDB data
 */
export const IgdbUtils = {
    /**
     * Extract genre names from IGDB genres array
     */
    getGenreNames(genres?: IgdbGenre[]): string[] {
        return genres?.map(genre => genre.name) || [];
    },
    
    /**
     * Extract theme names from IGDB themes array
     */
    getThemeNames(themes?: IgdbTheme[]): string[] {
        return themes?.map(theme => theme.name) || [];
    },
    
    /**
     * Extract platform names from IGDB platforms array
     */
    getPlatformNames(platforms?: IgdbPlatform[]): string[] {
        return platforms?.map(platform => platform.name) || [];
    },
    
    /**
     * Combine genres and themes into a single array
     */
    getAllTags(game: IgdbGame): string[] {
        return [
            ...this.getGenreNames(game.genres),
            ...this.getThemeNames(game.themes)
        ];
    }
};