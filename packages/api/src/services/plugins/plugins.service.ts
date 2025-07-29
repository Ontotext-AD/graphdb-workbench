import {Service} from '../../providers/service/service';
import {ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';
import {PluginsManifest} from '../../models/plugin-registry';
import {WindowService} from '../window/window.service';
import {PluginModule} from '../../models/plugin-registry';

export class PluginsService implements Service {
  private readonly pluginsRestService = ServiceProvider.get(PluginsRestService);

  async getPluginsManifest(): Promise<PluginsManifest> {
    const response = await this.pluginsRestService.getPluginsManifest();
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
