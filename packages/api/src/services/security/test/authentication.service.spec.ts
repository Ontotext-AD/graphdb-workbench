import {AuthenticationService} from '../authentication.service';
import {AuthenticatedUser, Authority, SecurityConfig} from '../../../models/security';
import {MapperProvider, ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
    ServiceProvider.get(AuthenticationStorageService).remove('jwt');
  });

  test('login should return the correct login message', () => {
    const result = authService.login();
    expect(result).toBe('Authentication.login from the API');
  });

  test('isAuthenticated should return true if the user is authenticated', () => {
    // When, I have a disabled security
    const disabledSecurityConfig = {enabled: false} as unknown as SecurityConfig;
    // Then, I expect to be authenticated
    expect(authService.isAuthenticated(disabledSecurityConfig)).toEqual(true);

    // When, I have a security config with enabled free access
    const user = {external: false} as unknown as AuthenticatedUser;
    // Then, I expect to be authenticated
    expect(authService.isAuthenticated(undefined, user)).toEqual(true);

    // When, I have a JWT token in the storage
    ServiceProvider.get(AuthenticationStorageService).set('jwt', 'token');
    // Then, I expect to be authenticated
    expect(authService.isAuthenticated()).toEqual(true);
  });

  test('isAuthenticated should return false if the user is not authenticated', () => {
    // Given, I have enabled security
    const enabledSecurityConfig = {enabled: true} as unknown as SecurityConfig;

    // When, I check, if I am authenticated
    // Then, I expect, not to be authenticated
    expect(authService.isAuthenticated(enabledSecurityConfig)).toEqual(false);

    // When, I have a user, who isn't externally logged in
    const user = {external: false} as unknown as AuthenticatedUser;
    // Then, I expect not to be authenticated
    expect(authService.isAuthenticated(enabledSecurityConfig, user)).toEqual(false);

    // When, I don't have a JWT token in the storage
    // Then, I expect not to be authenticated
    expect(authService.isAuthenticated(enabledSecurityConfig)).toEqual(false);
  });

  test('hasFreeAccess should return true if free access is enabled', () => {
    // Given, I have a security config with enabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: true}} as unknown as SecurityConfig;

    // When, I check, if free access is enabled
    // Then, I expect, to have free access
    expect(authService.hasFreeAccess(securityConfigWithFreeAccess)).toEqual(true);
  });

  test('hasFreeAccess should return false if free access is disabled', () => {
    // Given, I have a security config with disabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: false}} as unknown as SecurityConfig;

    // When, I check, if free access is enabled
    // Then, I expect, not to have free access
    expect(authService.hasFreeAccess(securityConfigWithFreeAccess)).toEqual(false);

    // When, I have disabled security
    const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;

    // When, I check, if free access is enabled
    // Then, I expect, not to have free access
    expect(authService.hasFreeAccess(securityConfigWithoutSecurity)).toEqual(false);
  });

  test('hasRole should return true if the user has the specified role/disabled security/free access', () => {
    // Given, I have a user with the role
    const userRole = 'ROLE_USER' as Authority;
    const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
    );
    // And, I have a security config with enabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: true}} as unknown as SecurityConfig;

    // When, I check, if the user has the role
    // Then, I expect, to have the role
    expect(authService.hasRole(userRole, securityConfigWithFreeAccess, userWithRole)).toEqual(true);

    // When, I have a disabled security
    const securityConfigWithoutSecurity = {enabled: false} as unknown as SecurityConfig;

    // When, I check, if the user has the role
    // Then, I expect to have the role
    expect(authService.hasRole(userRole, securityConfigWithoutSecurity, userWithRole)).toEqual(true);

    // When, I have a user without the role
    const userWithoutRole = {external: false, authorities: []} as unknown as AuthenticatedUser;

    // When, I check, if the user has a role, without supplying one
    // Then, I expect, to have the role
    expect(authService.hasRole(undefined, securityConfigWithFreeAccess, userWithoutRole)).toEqual(true);

    // When, I have 'IS_AUTHENTICATED_FULLY' authority
    // Then, I expect, to have the role
    const userWithIsAuthenticatedFullyAuthority = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {external: false, authorities: []} as unknown as AuthenticatedUser
    );
    expect(authService.hasRole(Authority.IS_AUTHENTICATED_FULLY, securityConfigWithFreeAccess, userWithIsAuthenticatedFullyAuthority)).toEqual(true);
  });

  test('hasRole should return false if the user does not have the specified role/free access', () => {
    // Given, I have a user with the role
    const userRole = 'ROLE_USER' as Authority;
    const userWithRole = MapperProvider.get(AuthenticatedUserMapper).mapToModel(
      {external: false, authorities: [userRole]} as unknown as AuthenticatedUser
    );
    // And, I have a security config with disabled free access
    const securityConfigWithFreeAccess = {enabled: true, freeAccess: {enabled: false}} as unknown as SecurityConfig;

    // When, I check, if the user has a higher role
    // Then, I expect, not to have the role
    expect(authService.hasRole(Authority.ROLE_MONITORING, securityConfigWithFreeAccess, userWithRole)).toEqual(false);

    // When, don't have a user and check, if the user has a role
    // Then, I expect, not to have the role
    expect(authService.hasRole(Authority.ROLE_MONITORING, securityConfigWithFreeAccess, undefined)).toEqual(false);
  });
});
