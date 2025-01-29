import {AuthenticatedUser} from '../../../../models/security';
import {AuthenticatedUserMapper} from '../authenticated-user.mapper';

describe('AuthenticatedUserMapper', () => {
  test('should map raw data to AuthenticatedUser model', () => {
    // Given I have a raw authenticated user object
    const newAuthenticatedUser = {
      username: 'john_doe',
      authorities: ['ROLE_ADMIN', 'ROLE_USER'],
    } as unknown as AuthenticatedUser;

    // When I map the raw data to an AuthenticatedUser model
    const mappedAuthenticatedUser = new AuthenticatedUserMapper().mapToModel(newAuthenticatedUser);

    // Then I expect the mapped model to be an instance of AuthenticatedUser
    expect(mappedAuthenticatedUser).toBeInstanceOf(AuthenticatedUser);
    // And the mapped model should have the same properties as the raw data
    expect(mappedAuthenticatedUser).toEqual(new AuthenticatedUser(newAuthenticatedUser));
  });
});
