import {AuthenticatedUser} from '../../../models/security/authenticated-user';
import {Mapper} from '../../../providers/mapper/mapper';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';
import {AuthorityList} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';

/**
 * Mapper class for converting partial AuthenticatedUser objects to complete AuthenticatedUser models.
 */
export class AuthenticatedUserMapper extends Mapper<AuthenticatedUser> {
  /**
   * Maps a partial AuthenticatedUser object to a complete AuthenticatedUser model.
   *
   * @param authenticatedUserResponse - A partial object containing some or all properties of an AuthenticatedUser.
   * @returns A new instance of AuthenticatedUser with all properties set based on the input.
   */
  mapToModel(authenticatedUserResponse: AuthenticatedUserResponse): AuthenticatedUser {
    return new AuthenticatedUser({
      username: authenticatedUserResponse.username,
      password: authenticatedUserResponse.password,
      authorities: new AuthorityList(authenticatedUserResponse.authorities),
      appSettings: new AppSettings(authenticatedUserResponse.appSettings),
      external: authenticatedUserResponse.external
    });
  }
}
