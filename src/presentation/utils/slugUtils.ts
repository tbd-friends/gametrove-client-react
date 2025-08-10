/**
 * Convert console name to URL-safe slug
 * Handles special characters like forward slashes, spaces, etc.
 */
export const consoleNameToSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[\/\\]/g, '-')  // Replace forward/back slashes with hyphens
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/[^\w\-]/g, '')  // Remove non-word characters except hyphens
        .replace(/\-+/g, '-')     // Replace multiple hyphens with single hyphen
        .replace(/^\-|\-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Convert URL slug back to display name
 * This is a best-effort conversion - ideally we'd store the mapping
 */
export const slugToDisplayName = (slug: string): string => {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\bX S\b/, 'X/S') // Special case for Xbox Series X/S
        .replace(/\b3ds\b/i, '3DS') // Special case for 3DS
        .replace(/\bPs(\d)\b/i, 'PS$1'); // Special case for PS1, PS2, etc.
};