import { Loggers } from '@ontotext/workbench-api';

const MODULE_NAME = 'SharedComponents';

/**
 * Logger for the Shared Components module.
 */
export class LoggerProvider {
  /**
   * Gets the logger instance for the Shared Components module.
   *
   * @returns LoggerService instance for the Shared Components module
   */
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}

