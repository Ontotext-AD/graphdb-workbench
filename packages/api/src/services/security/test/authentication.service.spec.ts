import {AuthenticationService} from '../authentication.service';
import {AuthenticatedUser, Authority, SecurityConfig} from '../../../models/security';
import {MapperProvider, ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
    ServiceProvider.get(AuthenticationStorageService).remove('jwt');
    ServiceProvider.get(SecurityContextService).updateSecurityConfig({} as unknown as SecurityConfig);
  });

  test('login should return the correct login message', () => {
    const result = authService.login();
    expect(result).toBe('Authentication.login from the API');
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

  test('logout should emit a Logout event', () => {
    const emitSpy = jest.spyOn(ServiceProvider.get(EventService), 'emit');
    authService.logout();
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(expect.any(Logout));
  });

});
