import {HttpService} from '../http/http.service';
import {Configuration, Environment} from '../../models/configuration';
import envDefault from './env.default.json';

export class ConfigurationRestService extends HttpService {
  async getConfiguration(): Promise<Configuration | undefined> {
    let environment: Environment = envDefault as Environment;
    try {
      environment = await this.get('assets/env.json');
    } catch {
      console.error('No downloadable "env.json" was found. Fallback to default:', environment);
    }

    let configResponse;
    try {
      await this.get(environment.configUrl);
      if (configResponse) {
        console.log(`Configuration file ${environment.configUrl} was downloaded`, configResponse);
        return configResponse as Configuration;
      }
    } catch {
      throw new Error(
        `Failed to download configuration from "${environment.configUrl}". Ensure that there is a
        "configuration.default.json" JSON file in the assets folder or provide an "env.json" file pointing to another
         configuration file.`
      );
    }
  }
}
