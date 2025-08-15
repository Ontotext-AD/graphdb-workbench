import {Service} from '../../providers/service/service';
import {Configuration} from '../../models/configuration';
import {ServiceProvider} from '../../providers';
import {ConfigurationRestService} from './configuration-rest.service';

export class ConfigurationService implements Service {
  getConfiguration(): Promise<Configuration | undefined> {
    return ServiceProvider.get(ConfigurationRestService).getConfiguration();
  }
}
