import {Service} from '../../providers/service/service';
import {ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';
import {PluginsManifest, PluginModule} from '../../models/plugin-registry';
import {WindowService} from '../window';

export class PluginsService implements Service {
  private readonly pluginsRestService = ServiceProvider.get(PluginsRestService);

  async getPluginsManifest(): Promise<PluginsManifest> {
    // Manifest should be a relative path, e.g. "/plugins/plugins.json"
    // Same origin as the shell/root-config
    const origin = WindowService.getWindow().location.origin;
    const response = await this.pluginsRestService.getPluginsManifest(origin);
    return response as PluginsManifest;
  }

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
