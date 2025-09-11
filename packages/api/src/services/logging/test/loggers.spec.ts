import {Loggers} from '../loggers';
import {LogModule} from '../../../models/logging/log-module';
import {BuildUtil} from '../../utils';

jest.mock('../../utils');
jest.mock('../logger.config.json', () => ({
  loggers: ['console'],
  minLogLevel: 0
}));

describe('Logging System Integration', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation()
    };
  });

  test('should log from Loggers factory to console output', () => {
    const apiLogger = Loggers.api;
    apiLogger.info('Integration test message', {data: 'test'});

    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    const loggedMessage = consoleSpy.info.mock.calls[0][0];

    expect(loggedMessage).toContain('[INFO]');
    expect(loggedMessage).toContain('[api]');
    expect(loggedMessage).toContain('Integration test message');

    const loggedArgs = consoleSpy.info.mock.calls[0][1];
    expect(loggedArgs).toEqual([{data: 'test'}]);
  });

  test('should hide debug logs in prod mode', () => {
    (BuildUtil.isDevMode as jest.Mock).mockReturnValue(false);

    const logger = Loggers.root;

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
    (BuildUtil.isDevMode as jest.Mock).mockReturnValue(true);
    Loggers.api.debug('Development debug message');
    expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
  });

  test('should hide debug logs in production mode', () => {
    (BuildUtil.isDevMode as jest.Mock).mockReturnValue(false);
    Loggers.api.debug('Production debug message');
    expect(consoleSpy.debug).not.toHaveBeenCalled();
  });

  test('should correctly identify each module in log messages', () => {
    const moduleTests = [
      {getter: () => Loggers.legacy, expectedModule: LogModule.LEGACY},
      {getter: () => Loggers.workbench, expectedModule: LogModule.WORKBENCH},
      {getter: () => Loggers.shared, expectedModule: LogModule.SHARED_COMPONENTS},
      {getter: () => Loggers.api, expectedModule: LogModule.API},
      {getter: () => Loggers.root, expectedModule: LogModule.ROOT}
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
