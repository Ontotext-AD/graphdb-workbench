import {AuthorizationService} from '../authorization.service';
import {SecurityContextService} from '../security-context.service';
import {AuthenticatedUser, Authority, AuthorityList, SecurityConfig} from '../../../models/security';
import {Repository} from '../../../models/repositories';
import {MapperProvider, ServiceProvider} from '../../../providers';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {WindowService} from '../../window';
import {RouteItemModel} from '../../../models/routing/route-item-model';
import {RoutingService} from '../../routing/routing.service';
import {RepositoryStorageService} from '../../repository';

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
    securityContextService.updateSecurityConfig({} as unknown as SecurityConfig);
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);
  });

  describe('hasFreeAccess', () => {
    test('hasFreeAccess should return true if free access is enabled', () => {
      // Given, I have a security config with enabled free access
      const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: true}} as unknown as SecurityConfig;
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithFreeAccess);
      // When, I check, if free access is enabled
      // Then, I expect, to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(true);
    });

    test('hasFreeAccess should return false if free access is disabled', () => {
      // Given, I have a security config with disabled free access
      const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: false}} as unknown as SecurityConfig;
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithFreeAccess);
      // When, I check, if free access is enabled
      // Then, I expect, not to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(false);

      // When, I have disabled security
      const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithoutSecurity);
      // When, I check, if free access is enabled
      // Then, I expect, not to have free access
      expect(authorizationService.hasFreeAccess()).toEqual(false);
    });
  });

  describe('hasRole', () => {
    test('hasRole should return true if the user has the specified role/disabled security/free access', () => {
      // Given, I have a user with the role
      const userRole = 'ROLE_USER' as Authority;
      const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(userWithRole);

      // And, I have a security config with enabled free access
      const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: true, authorities: new AuthorityList()}} as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfigWithFreeAccess);

      // When, I check, if the user has the role
      // Then, I expect, to have the role
      expect(authorizationService.hasRole(userRole)).toEqual(true);

      // When, I have a disabled security
      const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfigWithoutSecurity);

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
      const userWithIsAuthenticatedFullyAuthority = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: []} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(userWithIsAuthenticatedFullyAuthority);

      expect(authorizationService.hasRole(Authority.IS_AUTHENTICATED_FULLY)).toEqual(true);
    });

    test('hasRole should return false if the user does not have the specified role/free access', () => {
      // Given, I have a user with the role
      const userRole = 'ROLE_USER' as Authority;
      const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(userWithRole);

      // And, I have a security config with disabled free access
      const securityConfigWithFreeAccess = {
        enabled: true,
        freeAccess: {enabled: false, authorities: new AuthorityList()}
      } as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfigWithFreeAccess);

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
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfig);

      // When, I check if I can read a repository
      const repository = {id: 'testRepo'} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(false);
    });

    test('canReadRepo should return true when user has ROLE_ADMIN', () => {
      // Given, I have enabled security
      const securityConfig = {enabled: true, freeAccess: {enabled: false, authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a user with ROLE_ADMIN authority
      const adminUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_ADMIN]} as unknown as AuthenticatedUser
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
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a user with ROLE_REPO_MANAGER authority
      const repoManagerUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_REPO_MANAGER]} as unknown as AuthenticatedUser
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
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a user with ROLE_USER authority
      const user = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(user);

      // When, I check if I can read a repository
      const systemRepo = {id: 'SYSTEM'} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(systemRepo)).toBe(false);
    });

    test('canReadRepo should return true when security is not enabled regardless of user authentication status', () => {
      // Given, I have disabled security
      const securityConfig = {enabled: false} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

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
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a regular user with specific READ rights for a repository
      const repositoryId = 'testRepo';
      const readRepoAuthority = `READ_REPO_${repositoryId}` as Authority;
      const regularUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER, readRepoAuthority]} as unknown as AuthenticatedUser
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
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a regular user without specific READ rights for the repository
      const repositoryId = 'testRepo';
      const regularUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(regularUser);

      // When, I check if I can read a repository
      const repository = {id: repositoryId} as Repository;

      // Then, I expect not to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(false);
    });

    test('canReadRepo should return true for authenticated users with base READ rights for a specific repository location', () => {
      // Given, I have enabled security
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      const securityContextService = ServiceProvider.get(SecurityContextService);
      securityContextService.updateSecurityConfig(securityConfig);

      // And, I have a repository with a location
      const repositoryId = 'testRepo';
      const location = 'testLocation';
      const repository = {id: repositoryId, location: location} as Repository;

      // And, I have a regular user with specific READ rights for the repository with location
      const readRepoWithLocationAuthority = `READ_REPO_${repositoryId}@${location}` as Authority;
      const userWithSpecificLocationRights = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER, readRepoWithLocationAuthority]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(userWithSpecificLocationRights);

      // When, I check if I can read a repository
      // Then, I expect to have read access
      expect(authorizationService.canReadRepo(repository)).toBe(true);

      // And when I have a user with wildcard read rights
      const userWithWildcardRights = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER, 'READ_REPO_*' as Authority]} as unknown as AuthenticatedUser
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
      const userWithAdminAuthority = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [adminAuthority]} as unknown as AuthenticatedUser
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
      const regularUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(regularUser);

      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfig);

      jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([]);
      // Then, I shouldn't have authority
      expect(authorizationService.hasAuthority()).toBe(false);
    });

    test('should calculate authority of user', () => {
      // Given, I have a user without read permissions for all repositories
      const regularUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUser
      );
      securityContextService.updateAuthenticatedUser(regularUser);
      const securityConfig = {enabled: true, freeAccess: {authorities: new AuthorityList()}} as unknown as SecurityConfig;
      securityContextService.updateSecurityConfig(securityConfig);

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
});

