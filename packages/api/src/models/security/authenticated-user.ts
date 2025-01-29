import {Model} from '../common';
import {AuthorityList} from './authority-list';
import {MapperProvider} from '../../providers';
import {AuthorityListMapper} from '../../services/security/mappers/authority-list.mapper';
import {AppSettings} from './app-settings';

/**
 * Represents an authenticated user in the system
 */
export class AuthenticatedUser extends Model<AuthenticatedUser> {
  external: boolean;
  username: string;
  password: string;
  authorities: AuthorityList;
  appSettings: AppSettings;

  constructor(data: Partial<AuthenticatedUser>) {
    super();
    this.external = data.external || false;
    this.username = data.username || '';
    this.password = data.password || '';
    this.authorities = MapperProvider.get(AuthorityListMapper).mapToModel(data.authorities);
    this.appSettings = data.appSettings || {};
  }
}
