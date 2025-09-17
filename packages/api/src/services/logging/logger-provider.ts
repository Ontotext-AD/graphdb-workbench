import {Loggers} from './loggers';

const MODULE_NAME = 'API';

/**
 * Logger for the API module.
 */
export class LoggerProvider {
  /**
   * Gets the logger instance for the API module.
   *
   * @returns LoggerService instance for the API module
   */
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
