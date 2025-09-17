import {ServiceProvider, PluginsService} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

const loadPlugins = () => {
  return ServiceProvider.get(PluginsService).loadPlugins()
    .catch((error) => {
      logger.error('Failed to load plugins:', error);
    });
};

export const pluginsBootstrap = [loadPlugins];
