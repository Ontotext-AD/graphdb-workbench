import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {Configuration} from '../../models/configuration';

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
}
