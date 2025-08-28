import {service, PluginsService} from '@ontotext/workbench-api';

const loadPlugins = () => {
  // return service(PluginsService).loadPlugins()
  return service(PluginsService).loadPluginsManifest()
    .catch((error) => {
      console.error('Failed to load plugins:', error);
    });
};

export const pluginsBootstrap = [loadPlugins];
