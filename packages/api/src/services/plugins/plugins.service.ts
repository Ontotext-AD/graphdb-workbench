import {Service} from '../../providers/service/service';
import {ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';
import {PluginsManifest, PluginModule} from '../../models/plugin-registry';
import {WindowService} from '../window';

/**
 * Service responsible for managing plugins in the application.
 * Handles retrieving plugin manifests and loading plugins into the application.
 */
export class PluginsService implements Service {
  private readonly pluginsRestService = ServiceProvider.get(PluginsRestService);

  /**
   * Retrieves the plugins manifest from the server.
   *
   * @returns A promise that resolves to the plugins manifest containing information about available plugins.
   */
  async getPluginsManifest(): Promise<PluginsManifest> {
    return await this.pluginsRestService.getPluginsManifest();
  }

  /**
   * Loads all available plugins into the application.
   *
   * This method retrieves the plugins manifest, loads the plugin modules,
   * filters out any undefined modules, and registers each valid plugin
   * with the application's plugin registry.
   *
   * @returns A promise that resolves when all plugins have been loaded and registered.
   */
  async loadPlugins(): Promise<void> {
    const pluginsManifest = await this.getPluginsManifest();
    const pluginModules = await this.pluginsRestService.loadPlugins(pluginsManifest);
    pluginModules
      .filter((pluginModule): pluginModule is PluginModule => pluginModule !== undefined)
      .forEach((pluginModule: PluginModule) => {
        pluginModule.register(WindowService.getPluginRegistry());
      });
  }
}
