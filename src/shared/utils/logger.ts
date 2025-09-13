/**
 * Centralized Logging Utility
 * Provides environment-aware logging with different levels
 * Prevents console.log statements from reaching production
 */

import { environment } from '../config/environment';

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const;
export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

interface LoggerConfig {
  level: LogLevel;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  maxLogEntries: number;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private remoteEndpoint?: string;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: environment.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsoleOutput: environment.isDevelopment,
      enableRemoteLogging: environment.isProduction,
      maxLogEntries: 100,
      ...config,
    };

    // In production, you'd set this to your logging service endpoint
    if (this.config.enableRemoteLogging) {
      this.remoteEndpoint = `${environment.apiBaseUrl}/api/logs`;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown, context?: string): string {
    const levelName = Object.keys(LogLevel).find(key => LogLevel[key as keyof typeof LogLevel] === level) || 'UNKNOWN';
    const contextStr = context ? `[${context}] ` : '';
    const dataStr = data ? ` - ${JSON.stringify(data)}` : '';
    return `${contextStr}${message}${dataStr}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console in case remote logging fails
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      context,
    };

    // Add to buffer for debugging/inspection
    this.addToBuffer(entry);

    // Console output in development
    if (this.config.enableConsoleOutput) {
      const formattedMessage = this.formatMessage(level, message, data, context);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`🔍 ${formattedMessage}`);
          break;
        case LogLevel.INFO:
          console.info(`ℹ️ ${formattedMessage}`);
          break;
        case LogLevel.WARN:
          console.warn(`⚠️ ${formattedMessage}`);
          break;
        case LogLevel.ERROR:
          console.error(`❌ ${formattedMessage}`);
          break;
      }
    }

    // Send to remote logging service in production
    if (this.config.enableRemoteLogging) {
      this.sendToRemote(entry).catch(() => {
        // Silent catch to prevent infinite logging loop
      });
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  error(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  // Utility methods for common logging scenarios
  apiCall(endpoint: string, method: string, data?: unknown): void {
    this.debug(`API ${method.toUpperCase()} ${endpoint}`, data, 'API');
  }

  apiResponse(endpoint: string, status: number, data?: unknown): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API Response ${status} for ${endpoint}`, data, 'API');
  }

  performance(label: string, duration: number): void {
    this.debug(`Performance: ${label} took ${duration}ms`, undefined, 'PERF');
  }

  userAction(action: string, data?: unknown): void {
    this.info(`User action: ${action}`, data, 'USER');
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Clear log buffer
  clearLogs(): void {
    this.logBuffer = [];
  }

  // Update configuration at runtime
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for custom logger instances
export const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config);
};

// Utility function to replace console.log calls
export const devLog = (message: string, data?: unknown): void => {
  if (environment.isDevelopment) {
    console.log(message, data);
  }
};

// Export types for external use
export type { LogEntry, LoggerConfig };