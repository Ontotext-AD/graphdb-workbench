import {LogLevel} from './log-level';

/**
 * Interface for logging functionality across the application.
 * Provides a standardized way to log messages with different severity levels.
 */
export interface Logger {
  /**
   * Logs a message with the specified level and optional arguments.
   *
   * @param level - The severity level of the log message
   * @param message - The main log message to be recorded
   * @param args - Additional arguments or context data to include with the log
   */
  log(level: LogLevel, message: string, args: unknown[]): void;
}
