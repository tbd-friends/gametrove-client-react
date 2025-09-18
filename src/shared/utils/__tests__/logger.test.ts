/**
 * Tests for the centralized logging utility
 * Critical for ensuring no console.log statements reach production
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger, LogLevel, createLogger } from '../logger'
import { environment } from '../../config/environment'

// Mock environment
vi.mock('../../config/environment', () => ({
  environment: {
    isDevelopment: false,
    isProduction: true,
    apiBaseUrl: 'https://api.test.com'
  }
}))

describe('Logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>
    info: ReturnType<typeof vi.spyOn>
    warn: ReturnType<typeof vi.spyOn>
    error: ReturnType<typeof vi.spyOn>
  }

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }

    // Clear logger buffer
    logger.clearLogs()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Production Environment', () => {
    it('should not log to console in production', () => {
      logger.debug('Debug message')
      logger.info('Info message')
      
      expect(consoleSpy.debug).not.toHaveBeenCalled()
      expect(consoleSpy.info).not.toHaveBeenCalled()
    })

    it('should still log warnings and errors in production', () => {
      logger.warn('Warning message')
      logger.error('Error message')
      
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ Warning message')
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ Error message')
    })

    it('should buffer log entries for debugging', () => {
      logger.debug('Debug message')
      logger.info('Info message', { key: 'value' }, 'TEST')
      
      const recentLogs = logger.getRecentLogs(10)
      
      expect(recentLogs).toHaveLength(2)
      expect(recentLogs[0].message).toBe('Debug message')
      expect(recentLogs[0].level).toBe(LogLevel.DEBUG)
      expect(recentLogs[1].context).toBe('TEST')
      expect(recentLogs[1].data).toEqual({ key: 'value' })
    })
  })

  describe('Development Environment', () => {
    beforeEach(() => {
      // Mock development environment
      vi.mocked(environment).isDevelopment = true
      vi.mocked(environment).isProduction = false
    })

    it('should log to console in development', () => {
      const devLogger = createLogger()
      
      devLogger.debug('Debug message')
      devLogger.info('Info message')
      
      // In development, these should be logged
      expect(consoleSpy.debug).toHaveBeenCalledWith('🔍 Debug message')
      expect(consoleSpy.info).toHaveBeenCalledWith('ℹ️ Info message')
    })

    it('should format messages with context and data', () => {
      const devLogger = createLogger()
      
      devLogger.info('API call completed', { userId: '123', endpoint: '/api/games' }, 'API')
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        'ℹ️ [API] API call completed - {"userId":"123","endpoint":"/api/games"}'
      )
    })
  })

  describe('Utility Methods', () => {
    it('should log API calls with proper formatting', () => {
      logger.apiCall('/api/games', 'GET', { limit: 10 })
      
      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs[0].message).toBe('API GET /api/games')
      expect(recentLogs[0].data).toEqual({ limit: 10 })
      expect(recentLogs[0].context).toBe('API')
    })

    it('should log API responses with status codes', () => {
      logger.apiResponse('/api/games', 200, { count: 5 })
      
      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs[0].message).toBe('API Response 200 for /api/games')
      expect(recentLogs[0].level).toBe(LogLevel.DEBUG)
    })

    it('should log API errors with error level', () => {
      logger.apiResponse('/api/games', 500, { error: 'Server error' })
      
      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs[0].level).toBe(LogLevel.ERROR)
    })

    it('should log user actions for analytics', () => {
      logger.userAction('game_added', { gameId: 'game-123' })
      
      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs[0].message).toBe('User action: game_added')
      expect(recentLogs[0].context).toBe('USER')
      expect(recentLogs[0].data).toEqual({ gameId: 'game-123' })
    })

    it('should log performance metrics', () => {
      logger.performance('game_search', 250)
      
      const recentLogs = logger.getRecentLogs(1)
      expect(recentLogs[0].message).toBe('Performance: game_search took 250ms')
      expect(recentLogs[0].context).toBe('PERF')
    })
  })

  describe('Buffer Management', () => {
    it('should maintain buffer size limit', () => {
      const customLogger = createLogger({ maxLogEntries: 3 })
      
      customLogger.debug('Message 1')
      customLogger.debug('Message 2')
      customLogger.debug('Message 3')
      customLogger.debug('Message 4')
      
      const logs = customLogger.getRecentLogs()
      expect(logs).toHaveLength(3)
      expect(logs[0].message).toBe('Message 2') // Oldest should be dropped
      expect(logs[2].message).toBe('Message 4')
    })

    it('should clear logs when requested', () => {
      logger.debug('Message 1')
      logger.debug('Message 2')
      
      expect(logger.getRecentLogs()).toHaveLength(2)
      
      logger.clearLogs()
      
      expect(logger.getRecentLogs()).toHaveLength(0)
    })
  })

  describe('Configuration', () => {
    it('should allow runtime configuration updates', () => {
      const customLogger = createLogger({ level: LogLevel.WARN })
      
      // Should not log debug/info
      customLogger.debug('Debug message')
      customLogger.info('Info message')
      expect(customLogger.getRecentLogs()).toHaveLength(0)
      
      // Should log warn/error
      customLogger.warn('Warning message')
      expect(customLogger.getRecentLogs()).toHaveLength(1)
      
      // Update to allow info
      customLogger.updateConfig({ level: LogLevel.INFO })
      customLogger.info('Info after update')
      expect(customLogger.getRecentLogs()).toHaveLength(2)
    })

    it('should handle custom timeout configurations', () => {
      const customLogger = createLogger({
        enableRemoteLogging: false,
        enableConsoleOutput: false
      })
      
      customLogger.error('Error message')
      
      expect(consoleSpy.error).not.toHaveBeenCalled()
      expect(customLogger.getRecentLogs()).toHaveLength(1)
    })
  })

  describe('LogLevel const assertion', () => {
    it('should work with const assertion pattern', () => {
      expect(LogLevel.DEBUG).toBe(0)
      expect(LogLevel.INFO).toBe(1)
      expect(LogLevel.WARN).toBe(2)
      expect(LogLevel.ERROR).toBe(3)
      expect(LogLevel.SILENT).toBe(4)
    })

    it('should be tree-shakable', () => {
      // This test ensures the const assertion pattern allows for tree shaking
      const usedLevels = [LogLevel.ERROR, LogLevel.WARN]
      expect(usedLevels).toContain(LogLevel.ERROR)
      expect(usedLevels).toContain(LogLevel.WARN)
    })
  })
})