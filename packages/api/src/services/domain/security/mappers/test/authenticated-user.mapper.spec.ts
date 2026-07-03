import {AuthenticatedUser, AuthenticatedUserResponse, Authority} from '../../../../../models/security';
import {mapAuthenticatedUserResponseToModel} from '../authenticated-user.mapper';

describe('mapAuthenticatedUserResponseToModel', () => {
  it('should add ROLE_MANAGE_REPO when user has ROLE_REPO_MANAGER', () => {
    // GIVEN: A repository manager user.
    const authenticatedUserResponse: AuthenticatedUserResponse = {
      authorities: [Authority.ROLE_REPO_MANAGER],
      username: 'tester',
      password: '',
      appSettings: {},
      external: false,
    };

    // WHEN: The authenticated user response is mapped to the UI model.
    const authenticatedUser = mapAuthenticatedUserResponseToModel(authenticatedUserResponse);

    // THEN: I expect the returned object to be an instance of the UI model.
    expect(authenticatedUser).toBeInstanceOf(AuthenticatedUser);
    // AND: The user has the ROLE_MANAGE_REPO authority.
    expect(authenticatedUser.authorities.getItems()).toContain(Authority.ROLE_MANAGE_REPO);
  });

  it('should add ROLE_MANAGE_REPO when user has repository-specific management authority', () => {
    // GIVEN: A user with management permission for a repository.
    const authenticatedUserResponse: AuthenticatedUserResponse = {
      authorities: [Authority.MANAGE_REPO_PREFIX + 'repositoryId-123'],
      username: 'tester',
      password: '',
      appSettings: {},
      external: false,
    };

    // WHEN: The authenticated user response is mapped to the UI model.
    const authenticatedUser = mapAuthenticatedUserResponseToModel(authenticatedUserResponse);

    // THEN: I expect the returned object to be an instance of the UI model.
    expect(authenticatedUser).toBeInstanceOf(AuthenticatedUser);
    // AND: The user has the ROLE_MANAGE_REPO authority.
    expect(authenticatedUser.authorities.getItems()).toContain(Authority.ROLE_MANAGE_REPO);
  });

  it('should not add ROLE_MANAGE_REPO when user has no repository-specific management authority', () => {
    // GIVEN: A user without repository management permissions.
    const authenticatedUserResponse: AuthenticatedUserResponse = {
      authorities: [Authority.ROLE_USER],
      username: 'tester',
      password: '',
      appSettings: {},
      external: false,
    };

    // WHEN: The authenticated user response is mapped to the UI model.
    const authenticatedUser = mapAuthenticatedUserResponseToModel(authenticatedUserResponse);

    // THEN: I expect the returned object to be an instance of the UI model.
    expect(authenticatedUser).toBeInstanceOf(AuthenticatedUser);
    // AND: The user does not have the ROLE_MANAGE_REPO authority.
    expect(authenticatedUser.authorities.getItems()).not.toContain(Authority.ROLE_MANAGE_REPO);
  });
});
