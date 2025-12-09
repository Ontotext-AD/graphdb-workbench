import {User} from '../../models/users/user';
import {UserRequest} from '../../models/users/response-models/user-request';
import {MapperFn} from '../../providers/mapper/mapper-fn';

export const mapUserModelToRequest: MapperFn<User, UserRequest> = (data) => {
  return new UserRequest({
    password: data.password,
    grantedAuthorities: data.authorities.toGraphdbAuthoritiesModel(),
    appSettings: data.appSettings.toJSON()
  });
};

