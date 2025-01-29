import {AuthenticatedUser} from '../../../models/security/authenticated-user';
import {Mapper} from '../../../providers/mapper/mapper';

/**
 * Mapper class for converting partial AuthenticatedUser objects to complete AuthenticatedUser models.
 */
export class AuthenticatedUserMapper extends Mapper<AuthenticatedUser> {
  /**
   * Maps a partial AuthenticatedUser object to a complete AuthenticatedUser model.
   *
   * @param user - A partial object containing some or all properties of an AuthenticatedUser.
   * @returns A new instance of AuthenticatedUser with all properties set based on the input.
   */
  mapToModel(user: Partial<AuthenticatedUser>): AuthenticatedUser {
    return new AuthenticatedUser(user);
  }
}
