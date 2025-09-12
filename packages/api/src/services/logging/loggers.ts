import {LoggerService} from './logger-service';

/**
 * Static factory class for managing logger instances across different modules.
 * Implements a singleton pattern to ensure one logger instance per module.
 */
export class Loggers {
  private static readonly loggerInstances = new Map<string, LoggerService>();

  /**
   * Gets or creates a logger instance for the specified module.
   *
   * @param module - The module to get a logger for
   * @returns LoggerService instance for the module
   */
  static getLoggerInstance(module: string): LoggerService {
    if (!this.loggerInstances.has(module)) {
      this.loggerInstances.set(module, new LoggerService(module));
    }
    return this.loggerInstances.get(module)!;
  }
}
