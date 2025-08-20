import {ConfigurationService} from '../configuration.service';
import {ServiceProvider} from '../../../providers';
import {ConfigurationContextService} from '../configuration-context.service';
import {HttpService} from '../../http/http.service';
import {MissingApplicationConfigurationError} from '../missing-application-configuration-error';

describe('ConfigurationService', () => {
  let configurationService: ConfigurationService;

  beforeEach(() => {
    configurationService = new ConfigurationService();
  });

  it('should retrieve application configuration from configured file', async () => {
    const envJson = {
      configUrl: 'assets/dev.configuration.json'
    };
    const applicationConfig = {
      pluginsManifestPath: 'plugins/plugins-manifest.json'
    };
    jest.spyOn(HttpService.prototype, 'get')
      // Mock the environment JSON response
      .mockImplementationOnce(() => Promise.resolve(envJson))
      // Mock the application configuration response
      .mockImplementationOnce(() => Promise.resolve(applicationConfig));

    const config = await configurationService.getConfiguration();

    // Configuration should be retrieved and stored in the context
    expect(config).toBeDefined();
    expect(config).toHaveProperty('pluginsManifestPath');
    expect(config!.pluginsManifestPath).toBe('plugins/plugins-manifest.json');

    expect(ServiceProvider.get(ConfigurationContextService).getApplicationConfiguration()).toEqual(applicationConfig);
    expect(ServiceProvider.get(ConfigurationContextService).getApplicationConfiguration()).not.toBe(applicationConfig);
  });

  it('should handle missing env.json and fallback to default configuration', async () => {
    jest.spyOn(HttpService.prototype, 'get')
      // Mock the environment JSON response to throw an error
      .mockImplementationOnce(() => Promise.reject(new Error('env.json not found')))
      // Mock the default application configuration response
      .mockImplementationOnce(() => Promise.resolve({ pluginsManifestPath: 'default-plugins/plugins-manifest.json' }));

    const config = await configurationService.getConfiguration();

    expect(config).toBeDefined();
    expect(config).toHaveProperty('pluginsManifestPath');
    expect(config!.pluginsManifestPath).toBe('default-plugins/plugins-manifest.json');
  });

  it('should throw an error if configuration file cannot be downloaded', async () => {
    jest.spyOn(HttpService.prototype, 'get')
      // Mock the environment JSON response
      .mockImplementationOnce(() => Promise.resolve({ configUrl: 'assets/nonexistent.configuration.json' }))
      // Mock the configuration file download to throw an error
      .mockImplementationOnce(() => Promise.reject(new Error('Configuration file not found')));

    // Expect the service to throw a MissingApplicationConfigurationError
    await expect(configurationService.getConfiguration()).rejects.toThrow(MissingApplicationConfigurationError);
  });
});
