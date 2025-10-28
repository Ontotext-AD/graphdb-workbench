import {Mapper} from '../../providers/mapper/mapper';
import {User} from '../../models/users/user';
import {UserRequest} from '../../models/users/response-models/user-request';

export class UserRequestMapper extends Mapper<UserRequest> {
  mapToModel(user: User): UserRequest {
    return new UserRequest({
      password: user.password,
      grantedAuthorities: user.authorities.toGraphdbAuthoritiesModel(),
      appSettings: user.appSettings.toJSON()
    });
  }
}
