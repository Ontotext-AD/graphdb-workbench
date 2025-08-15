import {Service} from '../../providers/service/service';
import {Configuration} from '../../models/configuration';
import {ServiceProvider} from '../../providers';
import {ConfigurationRestService} from './configuration-rest.service';
import {ConfigurationContextService} from './configuration-context.service';

/**
 * Service responsible for managing the application configuration.
 */
export class ConfigurationService implements Service {
  private readonly configurationRestService: ConfigurationRestService;

  constructor() {
    this.configurationRestService = ServiceProvider.get(ConfigurationRestService);
  }

  /**
   * Retrieves the application configuration by fetching it from the server.
   * The configuration is then stored in the ConfigurationContextService for easy access throughout the application.
   *
   * @returns A Promise that resolves to the application configuration object, or undefined if not found.
   */
  async getConfiguration(): Promise<Configuration | undefined> {
    const config = await this.configurationRestService.getConfiguration();
    if (config) {
      ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration(config);
    }
    return config;
  }
}
