import {ServiceProvider, ConfigurationService} from '@ontotext/workbench-api';

const loadConfigurations = () => {
  return ServiceProvider.get(ConfigurationService).getConfiguration()
    .catch((error) => {
      console.error('Failed to load configurations:', error);
    });
};

export const configurationsBootstrap = loadConfigurations;
