import {AuthenticationService} from '../authentication.service';
import {AuthenticatedUser, Authority, SecurityConfig} from '../../../models/security';
import {MapperProvider, ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {Repository} from '../../../models/repositories';
import {WindowService} from '../../window/window.service';
import {RouteItemModel} from '../../../models/routing/route-item-model';
import {RoutingService} from '../../routing/routing.service';
import {RepositoryStorageService} from '../../repository';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  const securityContextService = ServiceProvider.get(SecurityContextService);
  const windowMock = {
    PluginRegistry: {
      get: jest.fn()
    }
  } as unknown as Window;

  beforeEach(() => {
    authService = new AuthenticationService();
    ServiceProvider.get(AuthenticationStorageService).remove('jwt');
    securityContextService.updateSecurityConfig({} as unknown as SecurityConfig);
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);
  });

  test('isAuthenticated should return true if the user is authenticated', () => {
    // When, I have an enabled security and logged user
    const securityConfig = {enabled: true, userLoggedIn: true} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfig);
    // Then, I expect to be authenticated
    expect(authService.isAuthenticated()).toEqual(true);
  });

  test('isAuthenticated should return false if the user is not authenticated', () => {
    // Given, I have enabled security
    const enabledSecurityConfig = {enabled: true} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(enabledSecurityConfig);
    // When, I check, if I am authenticated
    // Then, I expect, not to be authenticated
    expect(authService.isAuthenticated()).toEqual(false);

    // Given, I have disabled security
    const disabledSecurityConfig = {enabled: false} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(disabledSecurityConfig);
    // When, I check, if I am authenticated
    // Then, I expect, not to be authenticated
    expect(authService.isAuthenticated()).toEqual(false);
  });

  test('hasFreeAccess should return true if free access is enabled', () => {
    // Given, I have a security config with enabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccessActive: true} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithFreeAccess);
    // When, I check, if free access is enabled
    // Then, I expect, to have free access
    expect(authService.hasFreeAccess()).toEqual(true);
  });

  test('hasFreeAccess should return false if free access is disabled', () => {
    // Given, I have a security config with disabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccessActive: false} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithFreeAccess);
    // When, I check, if free access is enabled
    // Then, I expect, not to have free access
    expect(authService.hasFreeAccess()).toEqual(false);

    // When, I have disabled security
    const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfigWithoutSecurity);
    // When, I check, if free access is enabled
    // Then, I expect, not to have free access
    expect(authService.hasFreeAccess()).toEqual(false);
  });

  test('isSecurityEnabled should return true if security is enabled', () => {
    // Given, I have a security config with enabled security
    const config = {enabled: true} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(config);
    // When, I check, security is enabled
    expect(authService.isSecurityEnabled()).toBe(true);
  });

  test('isSecurityEnabled should return false if security is disabled', () => {
    // Given, I have a security config with disabled security
    const config = {enabled: false} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(config);
    // When, I check, security is disabled
    expect(authService.isSecurityEnabled()).toBe(false);
  });

  test('hasRole should return true if the user has the specified role/disabled security/free access', () => {
    // Given, I have a user with the role
    const userRole = 'ROLE_USER' as Authority;
    const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
    );
    securityContextService.updateAuthenticatedUser(userWithRole);

    // And, I have a security config with enabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: true}} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfigWithFreeAccess);

    // When, I check, if the user has the role
    // Then, I expect, to have the role
    expect(authService.hasRole(userRole)).toEqual(true);

    // When, I have a disabled security
    const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfigWithoutSecurity);

    // When, I check, if the user has the role
    // Then, I expect to have the role
    expect(authService.hasRole(userRole)).toEqual(true);

    // When, I have a user without the role
    const userWithoutRole = {external: false, authorities: []} as unknown as AuthenticatedUser;
    securityContextService.updateAuthenticatedUser(userWithoutRole);

    // When, I check, if the user has a role, without supplying one
    // Then, I expect, to have the role
    expect(authService.hasRole(undefined)).toEqual(true);

    // When, I have 'IS_AUTHENTICATED_FULLY' authority
    // Then, I expect, to have the role
    const userWithIsAuthenticatedFullyAuthority = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: []} as unknown as AuthenticatedUser
    );
    securityContextService.updateAuthenticatedUser(userWithIsAuthenticatedFullyAuthority);

    expect(authService.hasRole(Authority.IS_AUTHENTICATED_FULLY)).toEqual(true);
  });

  test('hasRole should return false if the user does not have the specified role/free access', () => {
    // Given, I have a user with the role
    const userRole = 'ROLE_USER' as Authority;
    const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
        {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
    );
    securityContextService.updateAuthenticatedUser(userWithRole);

    // And, I have a security config with disabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: false}} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfigWithFreeAccess);

    // When, I check, if the user has a higher role
    // Then, I expect, not to have the role
    expect(authService.hasRole(Authority.ROLE_MONITORING)).toEqual(false);

    // When, don't have a user and check, if the user has a role
    // Then, I expect, not to have the role
    expect(authService.hasRole(Authority.ROLE_MONITORING)).toEqual(false);
  });

  test('logout should emit a Logout event', () => {
    const emitSpy = jest.spyOn(ServiceProvider.get(EventService), 'emit');
    authService.logout();
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(expect.any(Logout));
  });

  test('canReadRepo should return false when the repository is undefined', () => {
    expect(authService.canReadRepo(undefined)).toBe(false);
  });

  test('canReadRepo should return false when the repository ID is empty', () => {
    expect(authService.canReadRepo({ id: '' } as Repository)).toBe(false);
  });

  test('canReadRepo should return false when security is enabled but user is not authenticated', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfig);

    // When, I check if I can read a repository
    const repository = {id: 'testRepo'} as Repository;

    // Then, I expect not to have read access
    expect(authService.canReadRepo(repository)).toBe(false);
  });

  test('canReadRepo should return true when user has ROLE_ADMIN', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(repository)).toBe(true);

    // And I should have read access even to the SYSTEM repository
    const systemRepo = {id: 'SYSTEM'} as Repository;
    expect(authService.canReadRepo(systemRepo)).toBe(true);
  });

  test('canReadRepo should return true when user has ROLE_REPO_MANAGER', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(repository)).toBe(true);

    // And I should have read access even to the SYSTEM repository
    const systemRepo = {id: 'SYSTEM'} as Repository;
    expect(authService.canReadRepo(systemRepo)).toBe(true);
  });

  test('canReadRepo should return false when user tries to access SYSTEM repository', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(systemRepo)).toBe(false);
  });

  test('canReadRepo should return true when security is not enabled regardless of user authentication status', () => {
    // Given, I have disabled security
    const securityConfig = {enabled: false} as unknown as SecurityConfig;
    const securityContextService = ServiceProvider.get(SecurityContextService);
    securityContextService.updateSecurityConfig(securityConfig);

    // When, I check if I can read a repository
    const repository = {id: 'testRepo'} as Repository;

    // Then, I expect to have read access because security is disabled
    expect(authService.canReadRepo(repository)).toBe(true);

    // And the result should be the same for SYSTEM repository
    const systemRepo = {id: 'SYSTEM'} as Repository;
    expect(authService.canReadRepo(systemRepo)).toBe(true);
  });

  test('canReadRepo should return true when user has READ rights on a non-SYSTEM repository', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(repository)).toBe(true);

    // But I should still not have access to SYSTEM repository
    const systemRepo = {id: 'SYSTEM'} as Repository;
    expect(authService.canReadRepo(systemRepo)).toBe(false);
  });

  test('canReadRepo should return false when user does not have READ rights on repository', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(repository)).toBe(false);
  });

  test('canReadRepo should return true for authenticated users with base READ rights for a specific repository location', () => {
    // Given, I have enabled security
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    expect(authService.canReadRepo(repository)).toBe(true);

    // And when I have a user with wildcard read rights
    const userWithWildcardRights = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {external: false, authorities: [Authority.ROLE_USER, 'READ_REPO_*' as Authority]} as unknown as AuthenticatedUser
    );
    securityContextService.updateAuthenticatedUser(userWithWildcardRights);

    // Then, I expect to have read access to any repository
    expect(authService.canReadRepo(repository)).toBe(true);
  });

  test('hasAuthority should return true for admin users', () => {
    // Given, I have a user with admin authority
    const adminAuthority = Authority.ROLE_ADMIN;
    const userWithAdminAuthority = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {external: false, authorities: [adminAuthority]} as unknown as AuthenticatedUser
    );

    securityContextService.updateAuthenticatedUser(userWithAdminAuthority);

    // When, I check if the user has admin authority
    // Then, I expect to have admin authority
    expect(authService.hasAuthority()).toBe(true);
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

    const securityConfig = {enabled: true} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfig);

    jest.spyOn(windowMock.PluginRegistry, 'get').mockReturnValue([]);
    // Then, I shouldn't have authority
    expect(authService.hasAuthority()).toBe(false);
  });

  test('should calculate authority of user', () => {
    // Given, I have a user without read permissions for all repositories
    const regularUser = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {authorities: [Authority.ROLE_USER]} as unknown as AuthenticatedUser
    );
    securityContextService.updateAuthenticatedUser(regularUser);
    const securityConfig = {enabled: true} as unknown as SecurityConfig;
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
    ServiceProvider.get(RepositoryStorageService).setRepositoryReference({id: 'testRepoId', location: 'testLocation' });

    // When, I calculate the authority of the user
    // Then, I shouldn't have authority
    expect(authService.hasAuthority()).toBe(false);

    // When, I have read permissions for all repositories
    regularUser.authorities.addToStart('READ_REPO_*' as Authority);
    securityContextService.updateAuthenticatedUser(regularUser);
    // Then, I should have authority
    expect(authService.hasAuthority()).toBe(true);
  });
});
