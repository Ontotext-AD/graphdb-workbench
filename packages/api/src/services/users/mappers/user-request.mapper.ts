import {User} from '../../../models/users';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {UserRequest} from '../response/user-request';

export const mapUserModelToRequest: MapperFn<User, UserRequest> = (data) => {
  return new UserRequest({
    password: data.password,
    grantedAuthorities: data.authorities.toGraphdbAuthoritiesModel(),
    appSettings: data.appSettings.toJSON()
  });
};

