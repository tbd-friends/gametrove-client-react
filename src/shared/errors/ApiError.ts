/**
 * Structured Error Handling System
 * Provides consistent error types and user-friendly messages
 */

export const ErrorCategory = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  SERVER: 'SERVER',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN'
} as const;
export type ErrorCategory = typeof ErrorCategory[keyof typeof ErrorCategory];

export interface ErrorContext {
  endpoint?: string;
  method?: string;
  requestId?: string;
  userId?: string;
  timestamp?: Date;
  additionalData?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly category: ErrorCategory;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly isRetryable: boolean;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    category: ErrorCategory,
    statusCode: number,
    userMessage: string,
    isRetryable = false,
    context: ErrorContext = {},
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.category = category;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.isRetryable = isRetryable;
    this.context = { ...context, timestamp: new Date() };
    this.originalError = originalError;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static fromHttpResponse(
    response: Response,
    context: ErrorContext = {}
  ): ApiError {
    const { status } = response;
    
    // Determine category based on status code
    let category: ErrorCategory;
    let userMessage: string;
    let isRetryable = false;

    switch (true) {
      case status === 401:
        category = ErrorCategory.AUTHENTICATION;
        userMessage = 'Please log in to continue';
        break;
      case status === 403:
        category = ErrorCategory.AUTHORIZATION;
        userMessage = 'You do not have permission to perform this action';
        break;
      case status === 404:
        category = ErrorCategory.NOT_FOUND;
        userMessage = 'The requested resource was not found';
        break;
      case status === 409:
        category = ErrorCategory.CONFLICT;
        userMessage = 'This action conflicts with existing data';
        break;
      case status === 422:
        category = ErrorCategory.VALIDATION;
        userMessage = 'Please check your input and try again';
        break;
      case status === 429:
        category = ErrorCategory.RATE_LIMIT;
        userMessage = 'Too many requests. Please wait a moment and try again';
        isRetryable = true;
        break;
      case status >= 500:
        category = ErrorCategory.SERVER;
        userMessage = 'A server error occurred. Please try again later';
        isRetryable = true;
        break;
      default:
        category = ErrorCategory.NETWORK;
        userMessage = 'A network error occurred. Please check your connection';
        isRetryable = true;
    }

    const message = `HTTP ${status}: ${response.statusText}`;
    
    return new ApiError(
      message,
      category,
      status,
      userMessage,
      isRetryable,
      { ...context, endpoint: response.url, method: 'UNKNOWN' }
    );
  }

  static fromError(
    error: Error,
    context: ErrorContext = {},
    category = ErrorCategory.UNKNOWN
  ): ApiError {
    let apiError: ApiError;

    if (error instanceof ApiError) {
      // If it's already an ApiError, just update context
      apiError = new ApiError(
        error.message,
        error.category,
        error.statusCode,
        error.userMessage,
        error.isRetryable,
        { ...error.context, ...context },
        error.originalError || error
      );
    } else {
      // Convert generic error to ApiError
      let userMessage = 'An unexpected error occurred';
      let isRetryable = false;
      let errorCategory = category;

      // Handle common error types
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorCategory = ErrorCategory.NETWORK;
        userMessage = 'Network connection failed. Please check your internet connection';
        isRetryable = true;
      } else if (error.name === 'AbortError') {
        errorCategory = ErrorCategory.NETWORK;
        userMessage = 'Request was cancelled or timed out';
        isRetryable = true;
      } else if (error.name === 'TimeoutError') {
        errorCategory = ErrorCategory.NETWORK;
        userMessage = 'Request timed out. Please try again';
        isRetryable = true;
      }

      apiError = new ApiError(
        error.message,
        errorCategory,
        0, // No HTTP status for generic errors
        userMessage,
        isRetryable,
        context,
        error
      );
    }

    return apiError;
  }

  // Convenience factory methods
  static authentication(message: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.AUTHENTICATION,
      401,
      'Please log in to continue',
      false,
      context
    );
  }

  static authorization(message: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.AUTHORIZATION,
      403,
      'You do not have permission to perform this action',
      false,
      context
    );
  }

  static validation(message: string, userMessage: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.VALIDATION,
      422,
      userMessage,
      false,
      context
    );
  }

  static notFound(message: string, userMessage: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.NOT_FOUND,
      404,
      userMessage,
      false,
      context
    );
  }

  static network(message: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.NETWORK,
      0,
      'Network connection failed. Please check your internet connection',
      true,
      context
    );
  }

  static server(message: string, context?: ErrorContext): ApiError {
    return new ApiError(
      message,
      ErrorCategory.SERVER,
      500,
      'A server error occurred. Please try again later',
      true,
      context
    );
  }

  // Utility methods
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      statusCode: this.statusCode,
      userMessage: this.userMessage,
      isRetryable: this.isRetryable,
      context: this.context,
      stack: this.stack,
    };
  }

  toString(): string {
    return `${this.name} [${this.category}]: ${this.message}`;
  }
}