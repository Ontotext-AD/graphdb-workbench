import {AuthenticatedUser} from '../../../models/security/authenticated-user';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';
import {AuthorityList} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting partial AuthenticatedUser objects to complete AuthenticatedUser models.
 */
export const mapAuthenticatedUserResponseToModel: MapperFn<AuthenticatedUserResponse, AuthenticatedUser> = (data) => {
  return new AuthenticatedUser({
    username: data.username,
    password: data.password,
    authorities: new AuthorityList(data.authorities),
    appSettings: new AppSettings(data.appSettings),
    external: data.external
  });
};

