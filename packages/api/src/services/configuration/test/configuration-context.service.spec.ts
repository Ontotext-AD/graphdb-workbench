import {ConfigurationContextService} from '../configuration-context.service';
import {createDefaultConfiguration} from './configuration-provider';
import {ThemeMode} from '../../../models/application-settings';
import {Configuration} from '../../../models/configuration';

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

  describe('getApplicationLogoPath', () => {
    test('Should return light logo path when theme is dark (inverted).', () => {
      // Given a configuration with logo paths for both themes
      const configuration = createDefaultConfiguration();
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for dark theme,
      const logoPath = configurationContextService.getApplicationLogoPath(ThemeMode.dark);

      // Then I expect the light logo path to be returned (inverted).
      expect(logoPath).toBe('assets/graphdb-logo-light.svg');
    });

    test('Should return dark logo path when theme is light (inverted).', () => {
      // Given a configuration with logo paths for both themes
      const configuration = createDefaultConfiguration();
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for light theme,
      const logoPath = configurationContextService.getApplicationLogoPath(ThemeMode.light);

      // Then I expect the dark logo path to be returned (inverted).
      expect(logoPath).toBe('assets/graphdb-logo-dark.svg');
    });

    test('Should return default logo path when applicationLogoPaths is undefined.', () => {
      // Given a configuration without theme-specific logo paths
      const configuration: Configuration = {
        ...createDefaultConfiguration(),
        applicationLogoPaths: undefined as never
      };
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for light theme,
      const logoPath = configurationContextService.getApplicationLogoPath(ThemeMode.light);

      // Then I expect the default logo path to be returned.
      expect(logoPath).toBe('assets/graphdb-logo-dark.svg');
    });

    test('Should return default logo path when inverted theme path does not exist.', () => {
      // Given a configuration with only dark theme logo path
      const configuration: Configuration = {
        ...createDefaultConfiguration(),
        applicationLogoPaths: {
          dark: 'assets/graphdb-logo-dark.svg'
        }
      };
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for dark theme,
      const logoPath = configurationContextService.getApplicationLogoPath(ThemeMode.dark);

      // Then I expect the default logo path to be returned (since light path is missing).
      expect(logoPath).toBe('assets/graphdb-logo-dark.svg');
    });

    test('Should return default logo path when applicationLogoPaths is empty.', () => {
      // Given a configuration with empty logo paths
      const configuration: Configuration = {
        ...createDefaultConfiguration(),
        applicationLogoPaths: {}
      };
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for light theme,
      const logoPath = configurationContextService.getApplicationLogoPath(ThemeMode.light);

      // Then I expect the default logo path to be returned.
      expect(logoPath).toBe('assets/graphdb-logo-dark.svg');
    });

    test('Should handle custom logo paths correctly.', () => {
      // Given a configuration with custom logo paths
      const configuration: Configuration = {
        ...createDefaultConfiguration(),
        applicationLogoPaths: {
          light: 'custom/path/to/light-logo.svg',
          dark: 'custom/path/to/dark-logo.svg'
        },
        applicationLogoPath: 'custom/default-logo.svg'
      };
      configurationContextService.updateApplicationConfiguration(configuration);

      // When I get the logo path for dark theme,
      const darkThemeLogoPath = configurationContextService.getApplicationLogoPath(ThemeMode.dark);
      // Then I expect the custom light logo path to be returned.
      expect(darkThemeLogoPath).toBe('custom/path/to/light-logo.svg');

      // When I get the logo path for light theme,
      const lightThemeLogoPath = configurationContextService.getApplicationLogoPath(ThemeMode.light);
      // Then I expect the custom dark logo path to be returned.
      expect(lightThemeLogoPath).toBe('custom/path/to/dark-logo.svg');
    });
  });
});
