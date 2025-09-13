/**
 * Environment Configuration Module
 * Provides type-safe access to environment variables with validation
 */

interface EnvironmentConfig {
  readonly apiBaseUrl: string;
  readonly auth0Domain: string;
  readonly auth0ClientId: string;
  readonly apiAudience: string;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
}

class EnvironmentError extends Error {
  constructor(variable: string) {
    super(`Missing required environment variable: ${variable}`);
    this.name = 'EnvironmentError';
  }
}

/**
 * Validates and returns a required environment variable
 */
function getRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new EnvironmentError(name);
  }
  return value.trim();
}

/**
 * Validates URL format for security
 */
function validateUrl(url: string, variableName: string): string {
  try {
    const urlObj = new URL(url);
    // Ensure HTTPS in production
    if (import.meta.env.PROD && urlObj.protocol !== 'https:') {
      throw new Error(`${variableName} must use HTTPS in production`);
    }
    return url;
  } catch (error) {
    throw new Error(`Invalid URL format for ${variableName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates and validates the environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  try {
    const apiBaseUrl = getRequiredEnvVar('VITE_API_BASE_URL');
    const auth0Domain = getRequiredEnvVar('VITE_AUTH0_DOMAIN');
    const auth0ClientId = getRequiredEnvVar('VITE_AUTH0_CLIENT_ID');
    const apiAudience = getRequiredEnvVar('VITE_API_AUDIENCE');

    return {
      apiBaseUrl: validateUrl(apiBaseUrl, 'VITE_API_BASE_URL'),
      auth0Domain: validateUrl(`https://${auth0Domain}`, 'VITE_AUTH0_DOMAIN').replace('https://', ''),
      auth0ClientId,
      apiAudience,
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
    };
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    throw error;
  }
}

// Export the validated configuration
export const environment: EnvironmentConfig = createEnvironmentConfig();

// Export the error class for testing and error handling
export { EnvironmentError };