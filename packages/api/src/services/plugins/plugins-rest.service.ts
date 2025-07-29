import {HttpService} from '../http/http.service';

export class PluginsRestService extends HttpService {

  getPluginsManifest(): Promise<object> {
    return this.get('/plugins/plugins-manifest.json');
  }

  getPlugin(pluginPath: string): Promise<object> {
    return this.get(pluginPath);
  }
}
