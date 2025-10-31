import {Model} from '../common';
import {AuthorityList} from './authorization/authority-list';
import {MapperProvider} from '../../providers';
import {AppSettings} from '../users/app-settings';
import {User} from '../users/user';
import {GrantedAuthoritiesUiModelMapper} from '../../services/security/mappers/granted-authorities-ui-model.mapper';

/**
 * Represents an authenticated user in the system
 */
export class AuthenticatedUser extends Model<AuthenticatedUser> {
  username: string;
  password: string;
  authorities: AuthorityList;
  grantedAuthoritiesUiModel: AuthorityList;
  appSettings: AppSettings;
  external: boolean;

  /**
   * Converts the AuthenticatedUser instance to a User instance.
   *
   * @returns A User instance with the same properties as the AuthenticatedUser.
   */
  toUser(): User {
    return new User({
      username: this.username,
      authorities: this.authorities,
      appSettings: this.appSettings,
      external: this.external,
    });
  }

  /**
   * Creates an AuthenticatedUser instance from a User instance.
   * @param user
   */
  static fromUser(user: User): AuthenticatedUser {
    return new AuthenticatedUser({
      username: user.username,
      authorities: user.authorities,
      appSettings: user.appSettings,
      external: user.external,
    });
  }

  constructor(data?: Partial<AuthenticatedUser>) {
    super();
    this.external = data?.external ?? false;
    this.username = data?.username ?? '';
    this.password = data?.password ?? '';
    // TODO: Fix this BS. The admin user has `grantedAuthorities` insted of authorities as other users
    this.authorities = data?.authorities ?? new AuthorityList();
    this.grantedAuthoritiesUiModel = MapperProvider.get(GrantedAuthoritiesUiModelMapper).mapToModel(data?.authorities);
    this.appSettings = data?.appSettings ?? new AppSettings();
  }

  setAuthorities(authorityList: AuthorityList = new AuthorityList()) {
    this.authorities = authorityList;
    this.grantedAuthoritiesUiModel = MapperProvider.get(GrantedAuthoritiesUiModelMapper).mapToModel(authorityList.getItems());
    return this;
  }

  setAppSettings(appSettings: AppSettings = new AppSettings()) {
    this.appSettings = appSettings;
    return this;
  }
}
