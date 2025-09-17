import {Service} from '../../providers/service/service';
import {ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';
import {PluginsManifest, PluginModule} from '../../models/plugins';
import {WindowService} from '../window';
import {PluginsManifestMapper} from './mapper/plugins-manifest.mapper';
import {LoggerProvider} from '../logging/logger-provider';

/**
 * Service responsible for managing plugins in the application.
 * Handles retrieving plugin manifests and loading plugins into the application.
 */
export class PluginsService implements Service {
  private readonly pluginsRestService: PluginsRestService;
  private readonly pluginsManifestMapper: PluginsManifestMapper;
  private readonly logger = LoggerProvider.logger;

  constructor() {
    this.pluginsRestService = ServiceProvider.get(PluginsRestService);
    this.pluginsManifestMapper = new PluginsManifestMapper();
  }

  /**
   * Retrieves the plugins manifest from the server.
   *
   * @returns A promise that resolves to the plugins manifest containing information about available plugins.
   */
  async getPluginsManifest(): Promise<PluginsManifest> {
    const response = await this.pluginsRestService.getPluginsManifest();
    return this.pluginsManifestMapper.mapToModel(response);
  }

  /**
   * Loads all available plugins into the application.
   *
   * This method retrieves the plugins manifest, loads the plugin modules,
   * filters out any undefined modules, and registers each valid plugin
   * with the application's plugin registry.
   *
   * If the plugins manifest cannot be loaded, the application will continue to function with built-in plugins only.
   *
   * @returns A promise that resolves when all plugins have been loaded and registered.
   */
  async loadPlugins(): Promise<void> {
    let pluginsManifest: PluginsManifest | undefined = undefined;
    try {
      pluginsManifest = await this.getPluginsManifest();
    } catch (error) {
      this.logger.warn('Failed to load plugins manifest. Continue with the built-in plugins only.', error);
      // If the manifest cannot be loaded, we will continue with built-in plugins only.
      // This allows the application to function without external plugins.
    }

    if (pluginsManifest) {
      const pluginModules = await this.pluginsRestService.loadPlugins(pluginsManifest);
      pluginModules
        .filter((pluginModule): pluginModule is PluginModule => pluginModule !== undefined)
        .forEach((pluginModule: PluginModule) => {
          if (pluginModule.register !== undefined) {
            pluginModule.register(WindowService.getPluginRegistry());
          } else {
            this.logger.warn('Plugin module is missing the register method. Skipping registration.', pluginModule);
          }
        });
    }
  }
}
