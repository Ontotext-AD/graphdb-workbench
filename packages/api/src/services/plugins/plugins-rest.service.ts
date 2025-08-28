import {HttpService} from '../http/http.service';
import {PluginDefinition, PluginModule, PluginsManifest, PluginsManifestResponse} from '../../models/plugins';
import {getOrigin} from '../utils';
import {service} from '../../providers';
import {ConfigurationContextService} from '../configuration/configuration-context.service';

/**
 * Service responsible for handling REST operations related to plugins.
 */
export class PluginsRestService extends HttpService {
  private readonly configurationContextService = service(ConfigurationContextService);

  /**
   * Fetches the plugins manifest from the server.
   *
   * @returns A Promise that resolves to the plugins manifest object containing
   * information about available plugins.
   */
  getPluginsManifest(): Promise<PluginsManifestResponse> {
    const configuration = this.configurationContextService.getApplicationConfiguration();
    return this.get(configuration.pluginsManifestPath);
  }

  /**
   * Dynamically loads a plugin module based on the provided plugin definition.
   * @param pluginDefinition - The definition of the plugin to load, including its entry point.
   * @returns A Promise that resolves to the loaded plugin module, or undefined if loading fails
   */
  async loadPlugin(pluginDefinition: PluginDefinition): Promise<PluginModule | undefined> {
    try {
      const entryUrl = pluginDefinition.entry.startsWith('http')
        ? pluginDefinition.entry
        : `${getOrigin()}${pluginDefinition.entry}`;

      return await import(/* webpackIgnore: true */ entryUrl) as PluginModule;
    } catch (err) {
      console.warn(`Failed to load plugin ${pluginDefinition.name}:`, err);
    }
  }

  /**
   * Dynamically loads all plugins defined in the plugins manifest.
   *
   * @param pluginsManifest - The manifest object containing the list of plugins to load.
   * Each plugin definition includes entry points.
   *
   * @returns A Promise that resolves to an array of loaded plugin modules.
   */
  async loadPlugins(pluginsManifest: PluginsManifest) {
    return await Promise.all(
      pluginsManifest.getPluginDefinitions().getItems().map(async (pluginDef) => {
        return this.loadPlugin(pluginDef);
      })
    );
  }
}
