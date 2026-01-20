import {LoggerType} from '../../../models/logging/logger-type';
import {LogLevel} from '../../../models/logging/log-level';
import {Configuration} from '../../../models/configuration';

export const createDefaultConfiguration = (): Configuration => {
  return {
    applicationLogoPaths: {
      light: 'assets/graphdb-logo-light.svg',
      dark: 'assets/graphdb-logo-dark.svg'
    },
    applicationLogoPath: 'assets/graphdb-logo-dark.svg',
    applicationFaviconPath: 'assets/favicon.png',
    pluginsManifestPath: 'plugins/plugins-manifest.json',
    loggerConfig: {
      loggers: [LoggerType.CONSOLE],
      minLogLevel: LogLevel.DEBUG
    }
  };
};

export const createConfigurationWithInfoMinLogLevel = (): Configuration => {
  return {
    applicationLogoPaths: {
      light: 'assets/graphdb-logo-light.svg',
      dark: 'assets/graphdb-logo-dark.svg'
    },
    applicationLogoPath: 'assets/graphdb-logo-dark.svg',
    applicationFaviconPath: 'assets/favicon.png',
    pluginsManifestPath: 'plugins/plugins-manifest.json',
    loggerConfig: {
      loggers: [LoggerType.CONSOLE],
      minLogLevel: LogLevel.INFO
    }
  };
};
