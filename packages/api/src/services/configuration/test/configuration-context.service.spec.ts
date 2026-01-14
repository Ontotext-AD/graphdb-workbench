import {ConfigurationContextService} from '../configuration-context.service';
import {createDefaultConfiguration} from './configuration-provider';

describe('ConfigurationContextService', () => {
  let configurationContextService: ConfigurationContextService;

  beforeEach(() => {
    configurationContextService = new ConfigurationContextService();
  });

  test('Should update the application configuration in the context.', () => {
    const newConfiguration = createDefaultConfiguration();

    // When I update the application configuration,
    configurationContextService.updateApplicationConfiguration(newConfiguration);

    // Then I expect the configuration to be updated in the context.
    expect(configurationContextService.getApplicationConfiguration()).toEqual(newConfiguration);

    // And the configuration should be a different instance.
    expect(configurationContextService.getApplicationConfiguration()).not.toBe(newConfiguration);
  });
});
