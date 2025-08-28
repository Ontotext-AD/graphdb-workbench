import {Service} from '../../providers/service/service';
import {service, ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';
import {PluginsManifest, PluginModule, PluginDefinition} from '../../models/plugins';
import {WindowService} from '../window';
import {PluginsManifestMapper} from './mapper/plugins-manifest.mapper';
import {PluginsContextService} from './plugins-context.service';

/**
 * Service responsible for managing plugins in the application.
 * Handles retrieving plugin manifests and loading plugins into the application.
 */
export class PluginsService implements Service {
  private readonly pluginsRestService: PluginsRestService;
  private readonly pluginsManifestMapper: PluginsManifestMapper;

  constructor() {
    this.pluginsRestService = ServiceProvider.get(PluginsRestService);
    this.pluginsManifestMapper = new PluginsManifestMapper();
  }

  /**
   * Loads the plugins manifest and updates the PluginsContextService and WindowService with it.
   * @returns A promise that resolves to the loaded plugins manifest, or undefined if loading fails.
   */
  async loadPluginsManifest() {
    let pluginsManifest: PluginsManifest | undefined = undefined;
    try {
      pluginsManifest = await this.getPluginsManifest();
      // TODO: make sure manifest is maintained in a single source of truth
      service(PluginsContextService).updatePluginsManifest(pluginsManifest);
      WindowService.getPluginRegistry().setPluginsManifest(pluginsManifest);
    } catch (error) {
      console.warn('Failed to load plugins manifest. Continue with the built-in plugins only.', error);
      // If the manifest cannot be loaded, we will continue with built-in plugins only.
      // This allows the application to function without external plugins.
    }
    return pluginsManifest;
  }

  /**
   * Retrieves the plugins manifest from the server.
   *
   * @returns A promise that resolves to the plugins manifest containing information about available plugins.
   */
  async getPluginsManifest(): Promise<PluginsManifest> {
    const response = await this.pluginsRestService.getPluginsManifest();
    const pluginsManifestModel = this.pluginsManifestMapper.mapToModel(response);
    service(PluginsContextService).updatePluginsManifest(pluginsManifestModel);
    return pluginsManifestModel;
  }

  /**
   * Loads a plugin by its name.
   * @param name - The name of the plugin to load.
   * @returns A promise that resolves when the plugin is loaded, or undefined if not found.
   */
  loadPluginByName(name: string) {
    const pluginsManifest = service(PluginsContextService).getPluginsManifest();
    // const definition = pluginsManifest?.getPluginDefinitionByName('core-clickable-element');
    // console.log('%cplugins manifest', 'background: orange', pluginsManifest, definition);
    if (pluginsManifest) {
      const pluginDefinition = pluginsManifest.getPluginDefinitionByName(name);
      if (pluginDefinition) {
        return this.loadPlugin(pluginDefinition);
      } else {
        console.warn(`Plugin with name ${name} not found in the manifest.`);
      }
    } else {
      console.warn('Plugins manifest is not loaded.');
    }
  }

  /**
   * Loads a single plugin into the application.
   * @param pluginDefinition - The definition of the plugin to load, including its entry point.
   */
  async loadPlugin(pluginDefinition: PluginDefinition) {
    const pluginModule = await this.pluginsRestService.loadPlugin(pluginDefinition);
    if (pluginModule) {
      pluginModule.register(WindowService.getPluginRegistry());
    }
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
    const pluginsManifest = await this.loadPluginsManifest();
    if (pluginsManifest) {
      const pluginModules = await this.pluginsRestService.loadPlugins(pluginsManifest);
      pluginModules
        .filter((pluginModule): pluginModule is PluginModule => pluginModule !== undefined)
        .forEach((pluginModule: PluginModule) => {
          pluginModule.register(WindowService.getPluginRegistry());
        });
    }
  }
}
