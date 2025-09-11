export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export const toNumericLogLevel = (logLevel: LogLevel) => {
  return LOG_LEVEL_NUMERIC[logLevel];
};

const LOG_LEVEL_NUMERIC = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3
};
