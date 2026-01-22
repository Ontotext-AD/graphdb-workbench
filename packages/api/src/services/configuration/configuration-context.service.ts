import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {Configuration} from '../../models/configuration';
import {ThemeMode} from '../../models/application-settings';

type ConfigurationContextFields = {
  readonly APPLICATION_CONFIGURATION: string;
}

type ConfigurationContextFieldParams = {
  readonly APPLICATION_CONFIGURATION: Configuration;
};

/**
 * The ConfigurationContextService class manages the application's configuration context.
 * It allows updating and retrieving the application configuration.
 */
export class ConfigurationContextService extends ContextService<ConfigurationContextFields> implements DeriveContextServiceContract<ConfigurationContextFields, ConfigurationContextFieldParams> {
  readonly APPLICATION_CONFIGURATION = 'applicationConfiguration';

  updateApplicationConfiguration(configuration: Configuration): void {
    this.updateContextProperty(this.APPLICATION_CONFIGURATION, configuration);
  }

  getApplicationConfiguration(): Configuration {
    return this.getContextPropertyValue(this.APPLICATION_CONFIGURATION) as Configuration;
  }

  /**
   * Gets the application logo path based on the current theme.
   * @param theme The current theme mode.
   * @returns The path to the application logo.
   */
  getApplicationLogoPath(theme: ThemeMode | undefined): string {
    const config = this.getApplicationConfiguration();
    const logoPaths = config.applicationLogoPaths;
    // For light theme, use dark logo and vice versa
    const invertedTheme = theme === ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    if (logoPaths && logoPaths[invertedTheme]) {
      return logoPaths[invertedTheme];
    }

    // Fallback to default logo
    return config.applicationLogoPath;
  }
}
