import { PluginsService } from '../plugins.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {PluginsManifestResponse} from '../../../models/plugins';
import {ServiceProvider} from '../../../providers';
import {ConfigurationContextService} from '../../configuration/configuration-context.service';

describe('PluginsService', () => {
  let pluginsService: PluginsService;

  beforeEach(() => {
    pluginsService = new PluginsService();
    ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration({
      pluginsManifestPath: 'plugins/plugins-manifest.json'});
  });

  it('should retrieve plugins manifest', async () => {
    const manifest: PluginsManifestResponse = {
      plugins: [{
        name: 'test-plugin',
        entry: 'test-plugin.js'
      }]
    };
    TestUtil.mockResponse(new ResponseMock('plugins/plugins-manifest.json').setResponse(manifest));

    const manifestModel = await pluginsService.getPluginsManifest();

    expect(manifestModel.getPluginDefinitions().getItems()).toEqual(manifest.plugins);
    expect(manifestModel.getPluginDefinitions().getItems().length).toBe(1);
  });

  // TODO: Find a way to test dynamic imports in Jest
  // it('should load and register plugins when manifest is available', async () => {
  //   const manifest: PluginsManifestResponse = {
  //     plugins: [{ name: 'test', entry: 'plugins/test.js' }]
  //   };
  //   TestUtil.mockResponse(new ResponseMock('plugins/plugins-manifest.json').setResponse(manifest));
  //   // TestUtil.mockResponse(new ResponseMock('http://localhost/plugins/test.js').setResponse(manifest));
  //   await pluginsService.loadPlugins();
  // });
  //
  // it('should continue without plugins if manifest fails to load', async () => {
  //
  // });
});

