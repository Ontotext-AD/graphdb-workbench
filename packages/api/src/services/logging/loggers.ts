import {LoggerService} from './logger-service';
import {LogModule} from '../../models/logging/log-module';

/**
 * Static factory class for managing logger instances across different modules.
 * Implements a singleton pattern to ensure one logger instance per module.
 */
export class Loggers {
  private static readonly loggerInstances = new Map<LogModule, LoggerService>();

  /**
   * Gets the logger instance for legacy module functionality.
   * @returns LoggerService instance for the legacy module
   */
  static get legacy(): LoggerService {
    return this.getLoggerInstance(LogModule.LEGACY);
  }

  /**
   * Gets the logger instance for the main workbench module.
   * @returns LoggerService instance for the workbench module
   */
  static get workbench(): LoggerService {
    return this.getLoggerInstance(LogModule.WORKBENCH);
  }

  /**
   * Gets the logger instance for shared-components module.
   * @returns LoggerService instance for the shared components module
   */
  static get shared(): LoggerService {
    return this.getLoggerInstance(LogModule.SHARED_COMPONENTS);
  }

  /**
   * Gets the logger instance for the API module.
   * @returns LoggerService instance for the API module
   */
  static get api(): LoggerService {
    return this.getLoggerInstance(LogModule.API);
  }

  /**
   * Gets the logger instance for the root module.
   * @returns LoggerService instance for the root module
   */
  static get root(): LoggerService {
    return this.getLoggerInstance(LogModule.ROOT);
  }

  /**
   * Gets or creates a logger instance for the specified module.
   *
   * @param module - The module to get a logger for
   * @returns LoggerService instance for the module
   */
  private static getLoggerInstance(module: LogModule): LoggerService {
    if (!this.loggerInstances.has(module)) {
      this.loggerInstances.set(module, new LoggerService(module));
    }
    return this.loggerInstances.get(module)!;
  }
}
