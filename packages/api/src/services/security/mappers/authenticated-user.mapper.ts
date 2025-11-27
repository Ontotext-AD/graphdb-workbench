import {AuthenticatedUser} from '../../../models/security/authenticated-user';
import {Mapper} from '../../../providers/mapper/mapper';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';
import {AuthorityList} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';
import {GrantedAuthoritiesUiModelMapper} from './granted-authorities-ui-model.mapper';

/**
 * Mapper class for converting partial AuthenticatedUser objects to complete AuthenticatedUser models.
 */
export class AuthenticatedUserMapper extends Mapper<AuthenticatedUser> {
  private readonly grantedAuthoritiesUiModelMapper = new GrantedAuthoritiesUiModelMapper();

  /**
   * Maps a partial AuthenticatedUser object to a complete AuthenticatedUser model.
   *
   * @param data - A partial object containing some or all properties of an AuthenticatedUser.
   * @returns A new instance of AuthenticatedUser with all properties set based on the input.
   */
  mapToModel(data: AuthenticatedUserResponse): AuthenticatedUser {
    const authorities = new AuthorityList(data.authorities ?? []);
    const grantedAuthoritiesUiModel =
      this.grantedAuthoritiesUiModelMapper.mapToModel(data.authorities ?? []);
    const appSettings = new AppSettings(data.appSettings);

    return new AuthenticatedUser({
      external: data.external ?? false,
      username: data.username ?? '',
      password: data.password ?? '',
      authorities,
      grantedAuthoritiesUiModel,
      appSettings,
    });
  }
}
