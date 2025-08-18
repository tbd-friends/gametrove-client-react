import { GameCondition } from './GameCopy';
import { PlatformType } from './Platform';
import { UserStatus, ProfileVisibility, CollectionVisibility, Theme } from './User';
import { CollectionPrivacy } from './Collection';

/**
 * Validation utilities for domain models
 */

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a price is valid (positive number)
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

/**
 * Validates if a date string is in ISO format
 */
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

/**
 * Validates if a game condition is valid
 */
export function isValidGameCondition(condition: string): condition is GameCondition {
  return Object.values(GameCondition).includes(condition as GameCondition);
}

/**
 * Validates if a platform type is valid
 */
export function isValidPlatformType(type: string): type is PlatformType {
  return Object.values(PlatformType).includes(type as PlatformType);
}

/**
 * Validates if a user status is valid
 */
export function isValidUserStatus(status: string): status is UserStatus {
  return Object.values(UserStatus).includes(status as UserStatus);
}

/**
 * Validates if a profile visibility setting is valid
 */
export function isValidProfileVisibility(visibility: string): visibility is ProfileVisibility {
  return Object.values(ProfileVisibility).includes(visibility as ProfileVisibility);
}

/**
 * Validates if a collection visibility setting is valid
 */
export function isValidCollectionVisibility(visibility: string): visibility is CollectionVisibility {
  return Object.values(CollectionVisibility).includes(visibility as CollectionVisibility);
}

/**
 * Validates if a collection privacy setting is valid
 */
export function isValidCollectionPrivacy(privacy: string): privacy is CollectionPrivacy {
  return Object.values(CollectionPrivacy).includes(privacy as CollectionPrivacy);
}

/**
 * Validates if a theme is valid
 */
export function isValidTheme(theme: string): theme is Theme {
  return Object.values(Theme).includes(theme as Theme);
}

/**
 * Validates if a UPC/barcode is valid format
 */
export function isValidUPC(upc: string): boolean {
  // UPC should be 12 digits
  return /^\d{12}$/.test(upc);
}

/**
 * Validates if a user rating is within valid range (1-10)
 */
export function isValidUserRating(rating: number): boolean {
  return typeof rating === 'number' && rating >= 1 && rating <= 10 && Number.isInteger(rating);
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a currency code is valid (3 letters)
 */
export function isValidCurrencyCode(currency: string): boolean {
  return /^[A-Z]{3}$/.test(currency);
}