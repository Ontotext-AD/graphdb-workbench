import {HttpService} from '../http/http.service';
import {PluginModule, PluginsManifest} from '../../models/plugin-registry';
import {WindowService} from '../window';

const MANIFEST_URL = '/plugins/plugins-manifest.json';

export class PluginsRestService extends HttpService {

  getPluginsManifest(origin: string): Promise<object> {
    const manifestFullUrl = `${origin}${MANIFEST_URL}`;
    return this.get(manifestFullUrl);
  }

  async loadPlugins(pluginsManifest: PluginsManifest) {
    // Same origin as the root-config
    const origin = WindowService.getWindow().location.origin;
    return await Promise.all(
      pluginsManifest.plugins.map(async (pluginDef) => {
        try {
          const entryUrl = pluginDef.entry.startsWith('http')
            ? pluginDef.entry
            : `${origin}${pluginDef.entry}`;

          return await import(/* webpackIgnore: true */ entryUrl) as PluginModule;
        } catch (err) {
          console.error(`Failed to load plugin ${pluginDef.name}:`, err);
        }
      })
    );
  }
}
