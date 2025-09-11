import {Loggers} from '../loggers';
import {ServiceProvider} from '../../../providers';
import {ConfigurationContextService} from '../../configuration/configuration-context.service';
import {LoggerType} from '../../../models/logging/logger-type';
import {LogLevel} from '../../../models/logging/log-level';

describe('Logging System Integration', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    Loggers['loggerInstances'].clear();
    ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration({
      pluginsManifestPath: 'plugins/plugins-manifest.json',
      loggerConfig: {
        loggers: [LoggerType.CONSOLE],
        minLogLevel: LogLevel.DEBUG
      }
    });
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };
  });

  test('should log from Loggers factory to console output', () => {
    const apiLogger = Loggers.getLoggerInstance('api');
    apiLogger.info('Integration test message', {data: 'test'});

    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    const loggedMessage = consoleSpy.info.mock.calls[0][0];

    expect(loggedMessage).toContain('[INFO]');
    expect(loggedMessage).toContain('[api]');
    expect(loggedMessage).toContain('Integration test message');

    const loggedArgs = consoleSpy.info.mock.calls[0][1];
    expect(loggedArgs).toEqual({data: 'test'});
  });

  test('should hide debug logs in prod mode', () => {
    ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration({
      pluginsManifestPath: 'plugins/plugins-manifest.json',
      loggerConfig: {
        loggers: [LoggerType.CONSOLE],
        minLogLevel: LogLevel.INFO
      }
    });

    const logger = Loggers.getLoggerInstance('root');

    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');

    expect(consoleSpy.debug).not.toHaveBeenCalled();
    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
  });

  test('should show debug logs in development mode', () => {
    Loggers.getLoggerInstance('api').debug('Development debug message');
    expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
  });

  test('should hide debug logs in production mode', () => {
    ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration({
      pluginsManifestPath: 'plugins/plugins-manifest.json',
      loggerConfig: {
        loggers: [LoggerType.CONSOLE],
        minLogLevel: LogLevel.INFO
      }
    });
    Loggers.getLoggerInstance('api').debug('Production debug message');
    expect(consoleSpy.debug).not.toHaveBeenCalled();
  });

  test('should correctly identify each module in log messages', () => {
    const moduleTests = [
      {getter: () => Loggers.getLoggerInstance('legacy'), expectedModule: 'legacy'},
      {getter: () => Loggers.getLoggerInstance('workbench'), expectedModule: 'workbench'},
      {getter: () => Loggers.getLoggerInstance('shared-components'), expectedModule: 'shared-components'},
      {getter: () => Loggers.getLoggerInstance('api'), expectedModule: 'api'},
      {getter: () => Loggers.getLoggerInstance('root'), expectedModule: 'root'}
    ];

    moduleTests.forEach(({getter, expectedModule}) => {
      const logger = getter();
      logger.info('Module test');

      const loggedMessage = consoleSpy.info.mock.calls[consoleSpy.info.mock.calls.length - 1][0];
      expect(loggedMessage).toContain(`[${expectedModule}]`);
    });

    expect(consoleSpy.info).toHaveBeenCalledTimes(5);
  });
});
