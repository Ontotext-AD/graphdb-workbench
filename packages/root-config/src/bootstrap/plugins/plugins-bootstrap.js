import {ServiceProvider, PluginsService} from '@ontotext/workbench-api';

const loadPlugins = () => {
  return ServiceProvider.get(PluginsService).loadPlugins()
    .catch(() => {
      console.error('Failed to load plugins');
    });
};

export const pluginsBootstrap = [loadPlugins];
