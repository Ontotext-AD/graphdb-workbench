import {HttpService} from '../http/http.service';
import {Configuration, Environment} from '../../models/configuration';
import envDefault from './env.default.json';
import {MissingApplicationConfigurationError} from './missing-application-configuration-error';

const ENV_JSON_URL = 'assets/env.json';

export class ConfigurationRestService extends HttpService {
  async getConfiguration(): Promise<Configuration | undefined> {
    let environment: Environment = envDefault as Environment;
    try {
      environment = await this.get(ENV_JSON_URL);
    } catch {
      console.warn('No downloadable "env.json" was found. Fallback to default:', environment);
    }

    let configResponse;
    try {
      configResponse = await this.get(environment.configUrl);
      if (configResponse) {
        console.info(`Configuration file ${environment.configUrl} was downloaded`, configResponse);
        return configResponse as Configuration;
      }
    } catch {
      throw new MissingApplicationConfigurationError(
        `Failed to download configuration from "${environment.configUrl}". Ensure that there is a
        "configuration.default.json" JSON file in the assets folder or provide an "env.json" file pointing to another
         configuration file.`
      );
    }
  }
}
