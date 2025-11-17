import {ConfigurationService} from '../configuration.service';
import {ServiceProvider} from '../../../providers';
import {ConfigurationContextService} from '../configuration-context.service';
import {MissingApplicationConfigurationError} from '../missing-application-configuration-error';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';

describe('ConfigurationService', () => {
  let configurationService: ConfigurationService;

  beforeEach(() => {
    configurationService = new ConfigurationService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  it('should retrieve application configuration from configured file', async () => {
    const envJson = {
      configUrl: 'assets/dev.configuration.json'
    };
    const applicationConfig = {
      pluginsManifestPath: 'plugins/plugins-manifest.json'
    };

    TestUtil.mockResponses([
      new ResponseMock('assets/env.json').setResponse(envJson).setStatus(200),
      new ResponseMock('assets/dev.configuration.json').setResponse(applicationConfig).setStatus(200)
    ]);

    const config = await configurationService.getConfiguration();

    // Configuration should be retrieved and stored in the context
    expect(config).toBeDefined();
    expect(config).toHaveProperty('pluginsManifestPath');
    expect(config!.pluginsManifestPath).toBe('plugins/plugins-manifest.json');

    expect(ServiceProvider.get(ConfigurationContextService).getApplicationConfiguration()).toEqual(applicationConfig);
    expect(ServiceProvider.get(ConfigurationContextService).getApplicationConfiguration()).not.toBe(applicationConfig);
  });

  it('should handle missing env.json and fallback to default configuration', async () => {
    const applicationConfig = {
      pluginsManifestPath: 'default-plugins/plugins-manifest.json'
    };

    TestUtil.mockResponses([
      new ResponseMock('assets/env.json').setStatus(404),
      new ResponseMock('assets/configuration.default.json').setResponse(applicationConfig).setStatus(200)
    ]);

    const config = await configurationService.getConfiguration();

    expect(config).toBeDefined();
    expect(config).toHaveProperty('pluginsManifestPath');
    expect(config!.pluginsManifestPath).toBe('default-plugins/plugins-manifest.json');
  });

  it('should throw an error if configuration file cannot be downloaded', async () => {
    const envJson = {
      configUrl: 'assets/nonexistent.configuration.json'
    };

    TestUtil.mockResponses([
      new ResponseMock('assets/env.json').setResponse(envJson).setStatus(200),
      new ResponseMock('assets/nonexistent.configuration.json').setStatus(404)
    ]);

    // Expect the service to throw a MissingApplicationConfigurationError
    await expect(configurationService.getConfiguration()).rejects.toThrow(MissingApplicationConfigurationError);
  });
});
