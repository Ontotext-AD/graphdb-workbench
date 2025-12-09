import {AuthorizationService} from '../authorization.service';
import {SecurityContextService} from '../security-context.service';
import {AuthenticatedUser, Authority, AuthorityList} from '../../../models/security';
import {Repository} from '../../../models/repositories';
import {ServiceProvider} from '../../../providers';
import {WindowService} from '../../window';
import {RouteItemModel} from '../../../models/routing/route-item-model';
import {RoutingService} from '../../routing/routing.service';
import {RepositoryStorageService} from '../../repository';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';
import {AuthSettings} from '../../../models/security/auth-settings';
import {AppSettings} from '../../../models/users/app-settings';
import {mapAuthenticatedUserResponseToModel} from '../mappers/authenticated-user.mapper';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';

const getSecurityConfig = (securityEnabled: boolean, freeAccessEnabled: boolean, overrideAuth = false) => {
  return SecurityConfigTestUtil.createSecurityConfig(
    {
      enabled: securityEnabled,
      freeAccess: new AuthSettings({enabled: freeAccessEnabled, authorities: new AuthorityList()}),
      overrideAuth: new AuthSettings({enabled: overrideAuth, authorities: new AuthorityList()} )
    }
  );
};

describe('AuthorizationService', () => {
  let authorizationService: AuthorizationService;
  const securityContextService = ServiceProvider.get(SecurityContextService);
  const windowMock = {
    PluginRegistry: {
      get: jest.fn()
    }
  } as unknown as Window;

  beforeEach(() => {
    authorizationService = new AuthorizationService();
    securityContextService.updateSecurityConfig(getSecurityConfig(false, false));
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);
  });

  describe('hasFreeAccess', () => {
    test('hasFreeAccess should return true if free access is enabled', () => {
      // Given, I have a security config with enabled free access
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(getSecurityConfig(true, true));
      // When, I check, if free access is enabled
      // Then, I expect, to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(true);
    });

    test('hasFreeAccess should return false if free access is disabled', () => {
      // Given, I have a security config with disabled free access
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(getSecurityConfig(true, false));
      // When, I check, if free access is enabled
      // Then, I expect, not to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(false);

      // When, I have disabled security
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(getSecurityConfig(false, false));
      // When, I check, if free access is enabled
      // Then, I expect, not to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(false);
    });
  });

  describe('hasRole', () => {
    test('hasRole should return true if the user has the specified role/disabled security/free access', () => {
      // Given, I have a user with the role
      const userRole = 'ROLE_USER' as Authority;
      const userWithRole = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithRole);

      // And, I have a security config with enabled free access
      securityContextService.updateSecurityConfig(getSecurityConfig(true, true));

      // When, I check, if the user has the role
      // Then, I expect, to have the role
      expect(authorizationService.hasRole(userRole)).toEqual(true);

      // When, I have a disabled security
      securityContextService.updateSecurityConfig(getSecurityConfig(false, false));

      // When, I check, if the user has the role
      // Then, I expect to have the role
      expect(authorizationService.hasRole(userRole)).toEqual(true);

      // When, I have a user without the role
      const userWithoutRole = {external: false, authorities: []} as unknown as AuthenticatedUser;
      securityContextService.updateAuthenticatedUser(userWithoutRole);

      // When, I check, if the user has a role, without supplying one
      // Then, I expect, to have the role
      expect(authorizationService.hasRole(undefined)).toEqual(true);

      // When, I have 'IS_AUTHENTICATED_FULLY' authority
      // Then, I expect, to have the role
      const userWithIsAuthenticatedFullyAuthority = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: []} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithIsAuthenticatedFullyAuthority);

      expect(authorizationService.hasRole(Authority.IS_AUTHENTICATED_FULLY)).toEqual(true);
    });

    test('hasRole should return false if the user does not have the specified role/free access', () => {
      // Given, I have a user with the role
      const userRole = 'ROLE_USER' as Authority;
      const userWithRole = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithRole);

      // And, I have a security config with disabled free access
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check, if the user has a higher role
      // Then, I expect, not to have the role
      expect(authorizationService.hasRole(Authority.ROLE_MONITORING)).toEqual(false);

      // When, don't have a user and check, if the user has a role
      // Then, I expect, not to have the role
      expect(authorizationService.hasRole(Authority.ROLE_MONITORING)).toEqual(false);
    });
  });

  describe('canReadRepo', () => {
    test('canReadRepo should return false when the repository is undefined', () => {
      expect(authorizationService.canReadRepo(undefined)).toBe(false);
    });

    test('canReadRepo should return false when the repository ID is empty', () => {
      expect(authorizationService.canReadRepo({id: ''} as Repository)).toBe(false);
    });

    test('canReadRepo should return false when security is enabled but user is not authenticated', () => {
      // Given, I have enabled security
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check if I can read a repository
      const repository = {id: 'testRepo'} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(false);
    });

    test('canReadRepo should return true when user has ROLE_ADMIN', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a user with ROLE_ADMIN authority
      const adminUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_ADMIN]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(adminUser);

      // When, I check if I can read a repository
      const repository = {id: 'testRepo'} as Repository;

      // Then, I expect to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // And I should have read access even to the SYSTEM repository
      const systemRepo = {id: 'SYSTEM'} as Repository;
      expect(authorizationService.canReadRepo(systemRepo)).toBe(true);
    });

    test('canReadRepo should return true when user has ROLE_REPO_MANAGER', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a user with ROLE_REPO_MANAGER authority
      const repoManagerUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_REPO_MANAGER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(repoManagerUser);

      // When, I check if I can read a repository
      const repository = {id: 'testRepo'} as Repository;

      // Then, I expect to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // And I should have read access even to the SYSTEM repository
      const systemRepo = {id: 'SYSTEM'} as Repository;
      expect(authorizationService.canReadRepo(systemRepo)).toBe(true);
    });

    test('canReadRepo should return false when user tries to access SYSTEM repository', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a user with ROLE_USER authority
      const user = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(user);

      // When, I check if I can read a repository
      const systemRepo = {id: 'SYSTEM'} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(systemRepo)).toBe(false);
    });

    test('canReadRepo should return true when security is not enabled regardless of user authentication status', () => {
      // Given, I have disabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(false, false));

      // When, I check if I can read a repository
      const repository = {id: 'testRepo'} as Repository;

      // Then, I expect to have read access because security is disabled
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // And the result should be the same for SYSTEM repository
      const systemRepo = {id: 'SYSTEM'} as Repository;
      expect(authorizationService.canReadRepo(systemRepo)).toBe(true);
    });

    test('canReadRepo should return true when user has READ rights on a non-SYSTEM repository', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a regular user with specific READ rights for a repository
      const repositoryId = 'testRepo';
      const readRepoAuthority = `READ_REPO_${repositoryId}` as Authority;
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, readRepoAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);

      // When, I check if I can read a repository
      const repository = {id: repositoryId} as Repository;

      // Then, I expect to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // But I should still not have access to SYSTEM repository
      const systemRepo = {id: 'SYSTEM'} as Repository;
      expect(authorizationService.canReadRepo(systemRepo)).toBe(false);
    });

    test('canReadRepo should return false when user does not have READ rights on repository', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a regular user without specific READ rights for the repository
      const repositoryId = 'testRepo';
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);

      // When, I check if I can read a repository
      const repository = {id: repositoryId} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(false);
    });

    test('canReadRepo should return true for authenticated users with base READ rights for a specific repository location', () => {
      // Given, I have enabled security
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // And, I have a repository with a location
      const repositoryId = 'testRepo';
      const location = 'testLocation';
      const repository = {id: repositoryId, location: location} as Repository;

      // And, I have a regular user with specific READ rights for the repository with location
      const readRepoWithLocationAuthority = `READ_REPO_${repositoryId}@${location}` as Authority;
      const userWithSpecificLocationRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, readRepoWithLocationAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithSpecificLocationRights);

      // When, I check if I can read a repository
      // Then, I expect to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // And when I have a user with wildcard read rights
      const userWithWildcardRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, 'READ_REPO_*' as Authority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithWildcardRights);

      // Then, I expect to have read access to any repository
      expect(authorizationService.canReadRepo(repository)).toBe(true);
    });
  });

  describe('hasAuthority', () => {
    test('hasAuthority should return true for admin users', () => {
      // Given, I have a user with admin authority
      const adminAuthority = Authority.ROLE_ADMIN;
      const userWithAdminAuthority = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [adminAuthority]} as unknown as AuthenticatedUserResponse
      );

      securityContextService.updateAuthenticatedUser(userWithAdminAuthority);

      // When, I check if the user has admin authority
      // Then, I expect to have admin authority
      expect(authorizationService.hasAuthority()).toBe(true);
    });

    test('hasAuthority should return false if there are no active routes', () => {
      // Given, I have no active routes, a regular user and enabled security
      jest.spyOn(WindowService, 'getWindow').mockReturnValue({
        location: {
          pathname: '/home'
        },
        PluginRegistry: {get: jest.fn(() => [])}
      } as unknown as Window);
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);

      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([]);
      // Then, I shouldn't have authority
      expect(authorizationService.hasAuthority()).toBe(false);
    });

    test('should calculate authority of user', () => {
      // Given, I have a user without read permissions for all repositories
      const regularUser = mapAuthenticatedUserResponseToModel(
        {authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      const activeRoute = new RouteItemModel({
        url: '/aclmanagement',
        module: 'graphdb.framework.aclmanagement',
        path: 'aclmanagement/app',
        chunk: 'aclmanagement',
        controller: 'AclManagementCtrl',
        templateUrl: 'pages/aclmanagement.html',
        title: 'view.aclmanagement.title',
        helpInfo: 'view.aclmanagement.helpInfo',
        documentationUrl: 'managing-fgac-workbench.html',
        allowAuthorities: [
          'READ_REPO_{repoId}'
        ]
      });
      const routingService = ServiceProvider.get(RoutingService);
      jest.spyOn(routingService, 'getActiveRoute').mockReturnValue(activeRoute);
      ServiceProvider.get(RepositoryStorageService).setRepositoryReference({id: 'testRepoId', location: 'testLocation'});

      // When, I calculate the authority of the user
      // Then, I shouldn't have authority
      expect(authorizationService.hasAuthority()).toBe(false);

      // When, I have read permissions for all repositories
      regularUser.authorities.addToStart('READ_REPO_*' as Authority);
      securityContextService.updateAuthenticatedUser(regularUser);
      // Then, I should have authority
      expect(authorizationService.hasAuthority()).toBe(true);
    });
  });

  describe('initializeFreeAccess', () => {
    test('should initialize free access user when security and free access are enabled', () => {
      // Given, I have security and free access enabled
      const config = SecurityConfigTestUtil.createSecurityConfig({
        enabled: true,
        freeAccess: new AuthSettings({enabled: true, authorities: [Authority.ROLE_USER] as unknown as AuthorityList, appSettings: new AppSettings()})
      });
      securityContextService.updateSecurityConfig(config);

      // When, I initialize free access
      authorizationService.initializeFreeAccess();

      // Then, I expect the authenticated user to be set with free access authorities and app settings
      const authenticatedUser = securityContextService.getAuthenticatedUser();
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser?.appSettings).toEqual({
        DEFAULT_INFERENCE: true,
        DEFAULT_SAMEAS: true,
        DEFAULT_VIS_GRAPH_SCHEMA: true,
        EXECUTE_COUNT: true,
        IGNORE_SHARED_QUERIES: false
      });
    });

    test('should not initialize free access user when security is disabled', () => {
      // Given, I have security disabled
      securityContextService.updateSecurityConfig(getSecurityConfig(false, false));
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);

      // When, I initialize free access
      authorizationService.initializeFreeAccess();

      // Then, I expect no authenticated user to be set
      const authenticatedUser = securityContextService.getAuthenticatedUser();
      expect(authenticatedUser).toBeUndefined();
    });

    test('should not initialize free access user when free access is disabled', () => {
      // Given, I have security enabled but free access disabled
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);

      // When, I initialize free access
      authorizationService.initializeFreeAccess();

      // Then, I expect no authenticated user to be set
      const authenticatedUser = securityContextService.getAuthenticatedUser();
      expect(authenticatedUser).toBeUndefined();
    });
  });

  describe('isAdmin', () => {
    test('should return true when user has ROLE_ADMIN', () => {
      // Given, I have a user with admin role
      const adminUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_ADMIN]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(adminUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check if user is admin
      // Then, I expect true
      expect(authorizationService.isAdmin()).toBe(true);
    });

    test('should return false when user does not have ROLE_ADMIN', () => {
      // Given, I have a regular user without admin role
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check if user is admin
      // Then, I expect false
      expect(authorizationService.isAdmin()).toBe(false);
    });
  });

  describe('isRepoManager', () => {
    test('should return true when user has ROLE_REPO_MANAGER', () => {
      // Given, I have a user with repo manager role
      const repoManagerUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_REPO_MANAGER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(repoManagerUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check if user is repo manager
      // Then, I expect true
      expect(authorizationService.isRepoManager()).toBe(true);
    });

    test('should return false when user does not have ROLE_REPO_MANAGER', () => {
      // Given, I have a regular user without repo manager role
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));

      // When, I check if user is repo manager
      // Then, I expect false
      expect(authorizationService.isRepoManager()).toBe(false);
    });
  });

  describe('canWriteRepo', () => {
    test('should return false when repository is undefined', () => {
      // Given, I have no repository
      // When, I check if I can write to repository
      // Then, I expect false
      expect(authorizationService.canWriteRepo(undefined)).toBe(false);
    });

    test('should return false when repository ID is empty', () => {
      // Given, I have a repository with empty ID
      // When, I check if I can write to repository
      // Then, I expect false
      expect(authorizationService.canWriteRepo({id: ''} as Repository)).toBe(false);
    });

    test('should return true when security is disabled', () => {
      // Given, I have security disabled
      securityContextService.updateSecurityConfig(getSecurityConfig(false, false));
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write to repository
      // Then, I expect true
      expect(authorizationService.canWriteRepo(repository)).toBe(true);
    });

    test('should return false when security is enabled but user is not authenticated', () => {
      // Given, I have security enabled but no authenticated user
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write to repository
      // Then, I expect false
      expect(authorizationService.canWriteRepo(repository)).toBe(false);
    });

    test('should return true when user has ROLE_ADMIN', () => {
      // Given, I have admin user
      const adminUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_ADMIN]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(adminUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write to repository
      // Then, I expect true
      expect(authorizationService.canWriteRepo(repository)).toBe(true);
    });

    test('should return true when user has ROLE_REPO_MANAGER', () => {
      // Given, I have repo manager user
      const repoManagerUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_REPO_MANAGER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(repoManagerUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write to repository
      // Then, I expect true
      expect(authorizationService.canWriteRepo(repository)).toBe(true);
    });

    test('should return false when user tries to write to SYSTEM repository', () => {
      // Given, I have regular user and SYSTEM repository
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      const systemRepo = {id: 'SYSTEM'} as Repository;

      // When, I check if I can write to SYSTEM repository
      // Then, I expect false
      expect(authorizationService.canWriteRepo(systemRepo)).toBe(false);
    });

    test('should return true when user has WRITE rights on repository', () => {
      // Given, I have user with write rights for specific repository
      const repositoryId = 'testRepo';
      const writeRepoAuthority = `WRITE_REPO_${repositoryId}` as Authority;
      const userWithWriteRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, writeRepoAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithWriteRights);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      const repository = {id: repositoryId} as Repository;

      // When, I check if I can write to repository
      // Then, I expect true
      expect(authorizationService.canWriteRepo(repository)).toBe(true);
    });

    test('should return false when user does not have WRITE rights on repository', () => {
      // Given, I have user without write rights for repository
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      securityContextService.updateSecurityConfig(getSecurityConfig(true, false));
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write to repository
      // Then, I expect false
      expect(authorizationService.canWriteRepo(repository)).toBe(false);
    });
  });

  describe('canReadGqlRepo', () => {
    test('should return false when repository is undefined', () => {
      // Given, I have no repository
      // When, I check if I can read GraphQL from repository
      // Then, I expect false
      expect(authorizationService.canReadGqlRepo(undefined as unknown as Repository)).toBe(false);
    });

    test('should return false when repository ID is empty', () => {
      // Given, I have repository with empty ID
      // When, I check if I can read GraphQL from repository
      // Then, I expect false
      expect(authorizationService.canReadGqlRepo({id: ''} as Repository)).toBe(false);
    });

    test('should return false when user is not authenticated', () => {
      // Given, I have no authenticated user
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can read GraphQL from repository
      // Then, I expect false
      expect(authorizationService.canReadGqlRepo(repository)).toBe(false);
    });

    test('should return true when user has GraphQL READ rights for repository', () => {
      // Given, I have user with GraphQL read rights for specific repository
      const repositoryId = 'testRepo';
      const readGqlAuthority = `READ_REPO_${repositoryId}:GRAPHQL` as Authority;
      const userWithGqlReadRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, readGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithGqlReadRights);
      const repository = {id: repositoryId} as Repository;

      // When, I check if I can read GraphQL from repository
      // Then, I expect true
      expect(authorizationService.canReadGqlRepo(repository)).toBe(true);
    });

    test('should return true when user has wildcard GraphQL READ rights', () => {
      // Given, I have user with wildcard GraphQL read rights
      const wildcardGqlAuthority = 'READ_REPO_*:GRAPHQL' as Authority;
      const userWithWildcardRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, wildcardGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithWildcardRights);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can read GraphQL from repository
      // Then, I expect true
      expect(authorizationService.canReadGqlRepo(repository)).toBe(true);
    });
  });

  describe('canWriteGqlRepo', () => {
    test('should return false when repository is undefined', () => {
      // Given, I have no repository
      // When, I check if I can write GraphQL to repository
      // Then, I expect false
      expect(authorizationService.canWriteGqlRepo(undefined as unknown as Repository)).toBe(false);
    });

    test('should return false when repository ID is empty', () => {
      // Given, I have repository with empty ID
      // When, I check if I can write GraphQL to repository
      // Then, I expect false
      expect(authorizationService.canWriteGqlRepo({id: ''} as Repository)).toBe(false);
    });

    test('should return false when user is not authenticated', () => {
      // Given, I have no authenticated user
      securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write GraphQL to repository
      // Then, I expect false
      expect(authorizationService.canWriteGqlRepo(repository)).toBe(false);
    });

    test('should return true when user has GraphQL WRITE rights for repository', () => {
      // Given, I have user with GraphQL write rights for specific repository
      const repositoryId = 'testRepo';
      const writeGqlAuthority = `WRITE_REPO_${repositoryId}:GRAPHQL` as Authority;
      const userWithGqlWriteRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, writeGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithGqlWriteRights);
      const repository = {id: repositoryId} as Repository;

      // When, I check if I can write GraphQL to repository
      // Then, I expect true
      expect(authorizationService.canWriteGqlRepo(repository)).toBe(true);
    });

    test('should return true when user has wildcard GraphQL WRITE rights', () => {
      // Given, I have user with wildcard GraphQL write rights
      const wildcardGqlAuthority = 'WRITE_REPO_*:GRAPHQL' as Authority;
      const userWithWildcardRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, wildcardGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithWildcardRights);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if I can write GraphQL to repository
      // Then, I expect true
      expect(authorizationService.canWriteGqlRepo(repository)).toBe(true);
    });
  });

  describe('hasGqlRights', () => {
    test('should return true when user has GraphQL READ rights', () => {
      // Given, I have user with GraphQL read rights
      const repositoryId = 'testRepo';
      const readGqlAuthority = `READ_REPO_${repositoryId}:GRAPHQL` as Authority;
      const userWithGqlReadRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, readGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithGqlReadRights);
      const repository = {id: repositoryId} as Repository;

      // When, I check if user has any GraphQL rights
      // Then, I expect true
      expect(authorizationService.hasGqlRights(repository)).toBe(true);
    });

    test('should return true when user has GraphQL WRITE rights', () => {
      // Given, I have user with GraphQL write rights
      const repositoryId = 'testRepo';
      const writeGqlAuthority = `WRITE_REPO_${repositoryId}:GRAPHQL` as Authority;
      const userWithGqlWriteRights = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER, writeGqlAuthority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(userWithGqlWriteRights);
      const repository = {id: repositoryId} as Repository;

      // When, I check if user has any GraphQL rights
      // Then, I expect true
      expect(authorizationService.hasGqlRights(repository)).toBe(true);
    });

    test('should return false when user has no GraphQL rights', () => {
      // Given, I have user without GraphQL rights
      const regularUser = mapAuthenticatedUserResponseToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      const repository = {id: 'testRepo'} as Repository;

      // When, I check if user has any GraphQL rights
      // Then, I expect false
      expect(authorizationService.hasGqlRights(repository)).toBe(false);
    });
  });

  describe('Override Auth', () => {
    test('should initialize default when no user is logged in and override auth is enabled', async () => {
      const username = 'overrideauth';
      const disabledSecurityConfig = getSecurityConfig(false, false, true);
      securityContextService.updateSecurityConfig(disabledSecurityConfig);
      authorizationService.initializeOverrideAuth();
      const authenticatedUser = securityContextService.getAuthenticatedUser();
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser?.username).toBe(username);
    });

    test('should not initialize default user when security is enabled, or override auth is false', async () => {
      const enabledSecurityConfig = getSecurityConfig(true, false, true);
      securityContextService.updateSecurityConfig(enabledSecurityConfig);
      authorizationService.initializeOverrideAuth();
      expect(securityContextService.getAuthenticatedUser()).toBeUndefined();

      const disabledSecurityConfig = getSecurityConfig(false, false);
      securityContextService.updateSecurityConfig(disabledSecurityConfig);
      authorizationService.initializeOverrideAuth();
      expect(securityContextService.getAuthenticatedUser()).toBeUndefined();
    });
  });

  describe('wildcard permissions', () => {
    test('should calculate wildcard read and write rights', () => {
      // Given, I have a user with wildcard read permissions for EMSPGM- repositories
      const regularUser = mapAuthenticatedUserResponseToModel(
        {authorities: [Authority.ROLE_USER, 'READ_REPO_EMSPGM-*' as Authority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      const securityConfig = getSecurityConfig(true, false);
      securityContextService.updateSecurityConfig(securityConfig);

      // Then, I should have read rights for all EMSPGM-repositories
      expect(authorizationService.canReadRepo(new Repository({id: 'EMSPGM-'}))).toBe(true);
      expect(authorizationService.canReadRepo(new Repository({id: 'EMSPGM-1'}))).toBe(true);
      expect(authorizationService.canReadRepo(new Repository({id: 'EMSPGM-2'}))).toBe(true);
      expect(authorizationService.canReadRepo(new Repository({id: 'EMSPGM-3'}))).toBe(true);

      // Missing the - at the end. Not a complete match so should not have read rights
      expect(authorizationService.canReadRepo(new Repository({id: 'EMSPGM'}))).toBe(false);
      // No write rights for EMSPGM- repositories
      expect(authorizationService.canWriteRepo(new Repository({id: 'EMSPGM-1-'}))).toBe(false);
    });

    test('should calculate wildcard read and write GQL rights', () => {
      // Given, I have a user with wildcard read permissions for EMSPGM-*:GRAPHQL repositories
      const regularUser = mapAuthenticatedUserResponseToModel(
        {authorities: [Authority.ROLE_USER, 'READ_REPO_EMSPGM-*:GRAPHQL' as Authority]} as unknown as AuthenticatedUserResponse
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      const securityConfig = getSecurityConfig(true, false);
      securityContextService.updateSecurityConfig(securityConfig);

      // Then, I should have read rights for all EMSPGM-*:GRAPHQL repositories
      expect(authorizationService.canReadGqlRepo(new Repository({id: 'EMSPGM-'}))).toBe(true);
      expect(authorizationService.canReadGqlRepo(new Repository({id: 'EMSPGM-1'}))).toBe(true);

      // Not a complete match
      expect(authorizationService.canReadGqlRepo(new Repository({id: 'EMSPGM'}))).toBe(false);
      // No write permissions
      expect(authorizationService.canWriteGqlRepo(new Repository({id: 'EMSPGM'}))).toBe(false);
    });

    test('canReadRepo should return true, when there is no security configuration', () => {
      // Given, no security configuration
      // When, I check if a repository can be read
      const repository = new Repository({id: 'testRepoId', location: 'testLocation' });
      // Then, it should return true
      expect(authorizationService.canReadRepo(repository)).toBe(true);
    });
  });
});

