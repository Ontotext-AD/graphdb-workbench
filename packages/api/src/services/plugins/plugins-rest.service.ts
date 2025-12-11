import {HttpService} from '../http/http.service';
import {PluginModule, PluginsManifest} from '../../models/plugins';
import {getOrigin} from '../utils';
import {service} from '../../providers';
import {ConfigurationContextService} from '../configuration/configuration-context.service';
import {LoggerProvider} from '../logging/logger-provider';
import {PluginsManifestResponse} from './response/plugins-manifest-response';

/**
 * Service responsible for handling REST operations related to plugins.
 */
export class PluginsRestService extends HttpService {
  private readonly configurationContextService = service(ConfigurationContextService);
  private readonly logger = LoggerProvider.logger;

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
          this.logger.warn(`Failed to load plugin ${pluginDef.name}:`, err);
        }
      })
    );
  }
}
