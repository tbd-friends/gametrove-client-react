/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  
  /** Success status */
  success: boolean;
  
  /** Error message if any */
  error?: string;
  
  /** Additional metadata */
  meta?: ResponseMetadata;
}

/**
 * Pagination metadata for list responses
 */
export interface ResponseMetadata {
  /** Current page number */
  page?: number;
  
  /** Number of items per page */
  limit?: number;
  
  /** Total number of items */
  total?: number;
  
  /** Total number of pages */
  totalPages?: number;
  
  /** Whether there are more items */
  hasMore?: boolean;
}

/**
 * Error response structure
 */
export interface ApiError {
  success: false;
  error: string;
  errorCode?: string;
  details?: Record<string, any>;
}

/**
 * Success response structure
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ResponseMetadata;
}

/**
 * API response for paginated lists
 */
export interface PaginatedResponse<T> extends ApiSuccess<T[]> {
  meta: ResponseMetadata;
}

/**
 * API response for single items
 */
export type SingleItemResponse<T> = ApiSuccess<T> | ApiError;

/**
 * API response for lists (paginated or not)
 */
export type ListResponse<T> = ApiSuccess<T[]> | PaginatedResponse<T> | ApiError;