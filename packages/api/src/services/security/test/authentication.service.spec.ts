import {AuthenticationService} from '../authentication.service';
import {SecurityConfig} from '../../../models/security';
import {ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {WindowService} from '../../window/window.service';

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
    expect(authService.isLoggedIn()).toEqual(true);
  });

  test('isAuthenticated should return false if the user is not authenticated', () => {
    // Given, I have enabled security
    const enabledSecurityConfig = {enabled: true} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(enabledSecurityConfig);
    // When, I check, if I am authenticated
    // Then, I expect, not to be authenticated
    expect(authService.isLoggedIn()).toEqual(false);

    // Given, I have disabled security
    const disabledSecurityConfig = {enabled: false} as unknown as SecurityConfig;
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(disabledSecurityConfig);
    // When, I check, if I am authenticated
    // Then, I expect, not to be authenticated
    expect(authService.isLoggedIn()).toEqual(false);
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

  test('logout should emit a Logout event', () => {
    const emitSpy = jest.spyOn(ServiceProvider.get(EventService), 'emit');
    authService.logout();
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(expect.any(Logout));
  });
});
