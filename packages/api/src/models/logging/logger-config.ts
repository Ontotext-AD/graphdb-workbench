import {LoggerType} from './logger-type';
import {LogLevel} from './log-level';

/**
 * Configuration interface for logger settings.
 * Defines the structure for configuring logging behavior including
 * which loggers to use and the minimum log level to capture.
 */
export interface LoggerConfig {
  /**
   * Array of logger types to be used for logging operations.
   * Each logger type represents a different logging destination or format.
   */
  loggers: LoggerType[];

  /**
   * The minimum log level that will be processed and output.
   * Log messages below this level will be filtered out.
   */
  minLogLevel: LogLevel;
}
