import {Model} from '../common';
import {AppSettings} from './app-settings';
import {AuthorityList} from './authority-list';
import {MapperProvider} from '../../providers';
import {AuthorityListMapper} from '../../services/security/mappers/authority-list.mapper';

/**
 * Represents an authentication setting.
 */
export class AuthSettings extends Model<AuthSettings> {
  appSettings?: AppSettings;
  authorities: AuthorityList;
  enabled?: boolean;

  constructor(data: Partial<AuthSettings>) {
    super();
    this.appSettings = data.appSettings;
    this.authorities = MapperProvider.get(AuthorityListMapper).mapToModel(data.authorities);
    this.enabled = data.enabled;
  }
}
