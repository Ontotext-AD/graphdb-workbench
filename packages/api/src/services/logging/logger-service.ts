import {LOGGER_DEFINITIONS} from '../../models/logging/logger-definitions';
import {LogLevel, LOG_LEVEL_TO_STRING} from '../../models/logging/log-level';
import loggerConfigJson from './logger.config.json';
import {LoggerConfig} from '../../models/logging/logger-config';
import {BuildUtil} from '../utils';

/**
 * LoggerService provides module-specific logging functionality with configurable log levels and multiple loggers.
 *
 * The service automatically formats log messages with timestamp, module name, and log level information.
 * It supports multiple logger implementations and respects minimum log level configuration based on environment.
 */
export class LoggerService {
  private readonly module: string;
  private readonly config: LoggerConfig = loggerConfigJson as LoggerConfig;
  private readonly loggers = LOGGER_DEFINITIONS;
  private readonly minLogLevel = BuildUtil.isDevMode() ? this.config.minLogLevel : LogLevel.INFO;

  /**
   * Creates a new LoggerService instance for the specified module.
   *
   * @param module - The name of the module this logger instance belongs to
   */
  constructor(module: string) {
    this.module = module;
  }

  /**
   * Logs a debug message. Debug messages are only logged in development mode.
   *
   * @param message - The debug message to log
   * @param args - Additional arguments to include in the log output
   */
  debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  /**
   * Logs an error message. Error messages are always logged regardless of environment.
   *
   * @param message - The error message to log
   * @param args - Additional arguments to include in the log output
   */
  error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  /**
   * Logs an informational message.
   *
   * @param message - The informational message to log
   * @param args - Additional arguments to include in the log output
   */
  info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  /**
   * Logs a warning message.
   *
   * @param message - The warning message to log
   * @param args - Additional arguments to include in the log output
   */
  warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  /**
   * Internal method that handles the actual logging logic.
   * Forwards the log message to all configured loggers if the log level meets the minimum threshold.
   *
   * @param logLevel - The severity level of the log message
   * @param message - The message to log
   * @param args - Additional arguments to include in the log output
   * @throws {Error} When a configured logger is not found in LOGGER_DEFINITIONS
   */
  private log(logLevel: LogLevel, message: string, args: unknown[]): void {
    this.config.loggers.forEach((loggerKey) => {
      if (this.minLogLevel <= logLevel) {
        const logger = this.loggers.get(loggerKey);
        if (!logger) {
          throw new Error(`Logger '${loggerKey}' not found`);
        }
        const formattedMessage = this.getFormattedMessage(logLevel, message);
        logger.log(logLevel, formattedMessage, args);
      }
    });
  }

  /**
   * Formats a log message with log level, module name, timestamp, and additional arguments.
   *
   * @param logLevel - The severity level of the log message
   * @param message - The base message to format
   * @returns The formatted log message string
   */
  private getFormattedMessage(logLevel: LogLevel, message: string) {
    return `[${LOG_LEVEL_TO_STRING[logLevel]}] [${this.module}] [${new Date().toLocaleString()}] ${message}`;
  }
}
