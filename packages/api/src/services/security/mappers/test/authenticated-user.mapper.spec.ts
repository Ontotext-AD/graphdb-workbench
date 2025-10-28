import {AuthenticatedUser, AuthorityList} from '../../../../models/security';
import {AuthenticatedUserMapper} from '../authenticated-user.mapper';
import {AuthenticatedUserResponse} from '../../../../models/security/response-models/authenticated-user-response';

describe('AuthenticatedUserMapper', () => {
  test('should map raw data to AuthenticatedUser model', () => {
    // Given I have a raw authenticated user object
    const newAuthenticatedUser = {
      username: 'john_doe',
      authorities: ['ROLE_ADMIN', 'ROLE_USER']
    } as AuthenticatedUserResponse;

    const expectedAuthenticatedUser = new AuthenticatedUser({
      username: 'john_doe',
      authorities: new AuthorityList(['ROLE_ADMIN', 'ROLE_USER'])
    });

    // When I map the raw data to an AuthenticatedUser model
    const mappedAuthenticatedUser = new AuthenticatedUserMapper().mapToModel(newAuthenticatedUser);

    // Then I expect the mapped model to be an instance of AuthenticatedUser
    expect(mappedAuthenticatedUser).toBeInstanceOf(AuthenticatedUser);
    // And the mapped model should have the same properties as the raw data
    expect(mappedAuthenticatedUser).toEqual(expectedAuthenticatedUser);
  });
});
