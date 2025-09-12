import {LoggerType} from './logger-type';
import {ConsoleLoggerService} from '../../services/logging/console/console-logger.service';
import {service} from '../../providers';
import {Logger} from './logger';

/**
 * A mapping of available logger types to their corresponding logger service instances.
 * Adding loggers here will initialize them and make them available for use in the application.
 **/
export const LOGGER_DEFINITIONS = new Map<LoggerType, Logger>([
  [LoggerType.CONSOLE, service(ConsoleLoggerService)],
]);
