import { Loggers } from '@ontotext/workbench-api';

const MODULE_NAME = 'Workbench';

/**
 * Logger for the Workbench module.
 */
export class LoggingService {

  /**
   * Gets the logger instance for the Workbench module.
   *
   * @returns LoggerService instance for the Workbench module
   */
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
