import {Loggers} from '@ontotext/workbench-api';

const MODULE_NAME = 'ROOT_CONFIG';

/**
 * Service class that provides logging functionality for the root configuration.
 */
export class LoggingService {
  static get logger() {
    return Loggers.getLoggerInstance(MODULE_NAME);
  }
}
