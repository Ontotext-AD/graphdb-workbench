import {User} from '../../../models/users/user';
import {UserRequestMapper} from '../user-request.mapper';
import {UserRequest} from '../../../models/users/response-models/user-request';
import {Authority, AuthorityList} from '../../../models/security';
import {AppSettings} from '../../../models/users/app-settings';

describe('UserRequestMapper', () => {
  it('maps fields from User to UserRequest without mocks', () => {
    // Use real AuthorityList and AppSettings instances instead of jest mocks
    const realAuthorities = new AuthorityList([Authority.ROLE_ADMIN]);
    const realAppSettings = new AppSettings({ DEFAULT_INFERENCE: false });

    const user = new User({
      password: 'secret',
      authorities: realAuthorities,
      appSettings: realAppSettings,
    });

    const mapper = new UserRequestMapper();
    const result = mapper.mapToModel(user);

    expect(result).toBeInstanceOf(UserRequest);
    expect(result.password).toBe('secret');
    expect(result.grantedAuthorities).toEqual(['ROLE_ADMIN']);
    expect(result.appSettings).toEqual(realAppSettings.toJSON());
  });
});
