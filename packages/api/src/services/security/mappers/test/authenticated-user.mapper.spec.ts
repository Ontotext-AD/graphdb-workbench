import {AuthenticatedUser, AuthorityList} from '../../../../models/security';
import {AuthenticatedUserMapper} from '../authenticated-user.mapper';
import {AuthenticatedUserResponse} from '../../../../models/security/response-models/authenticated-user-response';
import {GrantedAuthoritiesUiModelMapper} from '../granted-authorities-ui-model.mapper';
import {AppSettings} from '../../../../models/users';

describe('AuthenticatedUserMapper', () => {
  test('should map raw data to AuthenticatedUser model', () => {
    // Given, I have a raw authenticated user DTO coming from the backend
    const newAuthenticatedUser: AuthenticatedUserResponse = {
      username: 'john_doe',
      authorities: ['ROLE_ADMIN', 'ROLE_USER'],
      password: '',
      appSettings: {},
      external: false
    };

    // And, I know how the UI authorities mapper expands the authorities list
    const uiMapper = new GrantedAuthoritiesUiModelMapper();
    const expectedUiAuthorities = uiMapper.mapToModel(
      newAuthenticatedUser.authorities
    );

    // And, I prepare the expected AuthenticatedUser model exactly as the mapper produces it
    const expectedAuthenticatedUser = new AuthenticatedUser({
      username: 'john_doe',
      password: '',
      external: false,
      authorities: new AuthorityList(['ROLE_ADMIN', 'ROLE_USER']),
      grantedAuthoritiesUiModel: expectedUiAuthorities,
      appSettings: new AppSettings(newAuthenticatedUser.appSettings),
    });

    // When, I map the raw DTO to an AuthenticatedUser model
    const mappedAuthenticatedUser =
      new AuthenticatedUserMapper().mapToModel(newAuthenticatedUser);

    // Then, I expect the mapped model to be an AuthenticatedUser instance
    expect(mappedAuthenticatedUser).toBeInstanceOf(AuthenticatedUser);

    // And, I expect it to match the fully constructed expected model
    expect(mappedAuthenticatedUser).toEqual(expectedAuthenticatedUser);
  });
});
