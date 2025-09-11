import {LoggerType} from './logger-type';
import {LogLevel} from './log-level';

export interface LoggerConfig {
  loggers: LoggerType[];
  minLogLevel: LogLevel;
}
