import {ServiceProvider, PluginsService} from '@ontotext/workbench-api';

const loadPlugins = () => {
  return ServiceProvider.get(PluginsService).loadPlugins()
    .catch((error) => {
      console.error('Failed to load plugins:', error);
    });
};

export const pluginsBootstrap = [loadPlugins];
