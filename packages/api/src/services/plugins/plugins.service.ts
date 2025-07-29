import {Service} from '../../providers/service/service';
import {ServiceProvider} from '../../providers';
import {PluginsRestService} from './plugins-rest.service';

interface Plugin {
  entry: string;
  name: string;
}

interface PluginsManifest {
  plugins: Plugin[];
}

export class PluginsService implements Service {
  private readonly pluginsRestService = ServiceProvider.get(PluginsRestService);

  getPluginsManifest(): Promise<PluginsManifest> {
    return this.pluginsRestService.getPluginsManifest()
      .then((response) => {
        console.log('%cmanifest', 'background: yellow', response);
        return response as PluginsManifest;
      });
  }

  loadPlugins(): Promise<void> {
    return this.getPluginsManifest()
      .then((manifest) => {
        const plugins = manifest['plugins'];
        if (plugins && Array.isArray(plugins)) {
          return Promise.all(plugins.map(plugin => this.pluginsRestService.getPlugin(plugin.entry)))
            .then(() => {
              console.log('%cPlugins loaded successfully', 'background: green');
            });
        } else {
          throw new Error('Invalid plugins manifest format');
        }
      })
      .catch(error => {
        console.error('Error loading plugins:', error);
        throw error;
      });
  }
}
