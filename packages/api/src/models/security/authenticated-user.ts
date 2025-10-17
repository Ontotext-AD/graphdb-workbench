import {Model} from '../common';
import {AuthorityList} from './authority-list';
import {MapperProvider} from '../../providers';
import {AuthorityListMapper} from '../../services/security/mappers/authority-list.mapper';
import {AppSettings} from './app-settings';
import {GrantedAuthoritiesUiModelMapper} from '../../services/security/mappers/granted-authorities-ui-model.mapper';

/**
 * Represents an authenticated user in the system
 */
export class AuthenticatedUser extends Model<AuthenticatedUser> {
  external: boolean;
  username: string;
  password: string;
  authorities: AuthorityList;
  grantedAuthoritiesUiModel: AuthorityList;
  appSettings: AppSettings;

  constructor(data?: Partial<AuthenticatedUser>) {
    super();
    this.external = data?.external ?? false;
    this.username = data?.username ?? '';
    this.password = data?.password ?? '';
    // TODO: Fix this BS. The admin user has `grantedAuthorities` insted of authorities as other users
    // @ts-expect-error grantedAuthorities is not defined in the model
    const authorities = data?.authorities ?? data?.['grantedAuthorities'];
    this.authorities = MapperProvider.get(AuthorityListMapper).mapToModel(authorities);
    this.grantedAuthoritiesUiModel = MapperProvider.get(GrantedAuthoritiesUiModelMapper).mapToModel(authorities);
    this.appSettings = data?.appSettings ?? {};
  }

  setAuthorities(authorityList: AuthorityList = new AuthorityList()) {
    this.authorities = authorityList;
    this.grantedAuthoritiesUiModel = MapperProvider.get(GrantedAuthoritiesUiModelMapper).mapToModel(authorityList.getItems());
    return this;
  }

  setAppSettings(appSettings: AppSettings = {}) {
    this.appSettings = appSettings;
    return this;
  }
}
