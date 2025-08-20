import {HttpService} from '../http/http.service';
import {PluginModule, PluginsManifest, PluginsManifestResponse} from '../../models/plugins';
import {getOrigin} from '../utils';

// TODO: move this to a configuration file or environment variable
const MANIFEST_URL = 'plugins/plugins-manifest.json';

/**
 * Service responsible for handling REST operations related to plugins.
 */
export class PluginsRestService extends HttpService {

  /**
   * Fetches the plugins manifest from the server.
   *
   * @returns A Promise that resolves to the plugins manifest object containing
   * information about available plugins.
   */
  getPluginsManifest(): Promise<PluginsManifestResponse> {
    return this.get(MANIFEST_URL);
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
        try {
          const entryUrl = pluginDef.entry.startsWith('http')
            ? pluginDef.entry
            : `${getOrigin()}${pluginDef.entry}`;

          return await import(/* webpackIgnore: true */ entryUrl) as PluginModule;
        } catch (err) {
          console.error(`Failed to load plugin ${pluginDef.name}:`, err);
        }
      })
    );
  }
}
