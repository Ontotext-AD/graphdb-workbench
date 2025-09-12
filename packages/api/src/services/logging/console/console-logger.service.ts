/* eslint-disable no-console */
import {Logger} from '../../../models/logging/logger';
import {LogLevel} from '../../../models/logging/log-level';

/**
 * Console-based logger implementation that outputs log messages to the browser console.
 *
 * This service implements the Logger interface and forwards log messages to the appropriate
 * console methods based on the log level. Each log level maps to its corresponding console
 * method for consistent output formatting and browser developer tools integration.
 */
export class ConsoleLoggerService implements Logger {
  /**
   * Logs a message to the console based on the specified log level.
   *
   * @param level - The log level determining which console method to use
   * @param message - The message to log to the console
   * @param args - Additional arguments to include in the log output
   */
  log(level: LogLevel, message: string, args: unknown[]): void {
    switch (level) {
    case LogLevel.DEBUG:
      console.debug(message, ...args);
      break;
    case LogLevel.INFO:
      console.info(message, ...args);
      break;
    case LogLevel.WARN:
      console.warn(message, ...args);
      break;
    case LogLevel.ERROR:
      console.error(message, ...args);
      break;
    default:
      console.debug(message, ...args);
    }
  }
}
