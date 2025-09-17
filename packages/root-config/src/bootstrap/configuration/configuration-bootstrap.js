import {ServiceProvider, ConfigurationService} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

const loadConfigurations = () => {
  return ServiceProvider.get(ConfigurationService).getConfiguration()
    .catch((error) => {
      logger.error('Failed to load configurations:', error);
    });
};

export const configurationsBootstrap = loadConfigurations;
