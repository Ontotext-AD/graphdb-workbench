import {AuthenticationService} from '../authentication.service';
import {SecurityConfig} from '../../../models/security';
import {service, ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {WindowService} from '../../window/window.service';
import {AuthStrategy} from '../../../models/security/authentication/auth-strategy';
import {AuthStrategyType} from '../../../models/security/authentication/auth-strategy-type';
import {AuthStrategyResolver} from '../auth-strategy-resolver';

class TestAuthStrategy implements AuthStrategy {
  type = AuthStrategyType.NO_SECURITY;

  initialize(): Promise<unknown> {
    return Promise.resolve();
  }

  isAuthenticated(): boolean {
    return true;
  }

  login(): Promise<void> {
    return Promise.resolve();
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

}

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let testAuthStrategy: TestAuthStrategy;

  const securityContextService = service(SecurityContextService);
  const windowMock = {
    PluginRegistry: {
      get: jest.fn()
    }
  } as unknown as Window;

  beforeEach(() => {
    service(AuthenticationStorageService).remove('jwt');
    const securityConfig = {} as unknown as SecurityConfig;
    securityContextService.updateSecurityConfig(securityConfig);
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);

    authService = new AuthenticationService();
  });

  describe('with Authentication strategy set', () => {
    beforeEach(() => {
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(ServiceProvider.get(AuthStrategyResolver), 'resolveStrategy').mockReturnValue(testAuthStrategy);
      const securityConfig = {} as unknown as SecurityConfig;
      authService.setAuthenticationStrategy(securityConfig);
    });

    test('should call initialize on authentication strategy when set', () => {
      const initSpy = jest.spyOn(testAuthStrategy, 'initialize');
      const securityConfig = {} as unknown as SecurityConfig;
      authService.setAuthenticationStrategy(securityConfig);
      expect(initSpy).toHaveBeenCalled();
    });

    test('isAuthenticated should return true if authentication strategy returns true', () => {
      jest.spyOn(testAuthStrategy, 'isAuthenticated').mockReturnValue(true);
      expect(authService.isAuthenticated()).toBe(true);
      expect(testAuthStrategy.isAuthenticated).toHaveBeenCalled();
    });

    test('isAuthenticated should return false if authentication strategy returns false', () => {
      jest.spyOn(testAuthStrategy, 'isAuthenticated').mockReturnValue(false);
      expect(authService.isAuthenticated()).toBe(false);
      expect(testAuthStrategy.isAuthenticated).toHaveBeenCalled();
    });

    test('login should call authentication strategy login', () => {
      const testAuthStrategySpy = jest.spyOn(testAuthStrategy, 'login');
      authService.login('username', 'password');
      expect(testAuthStrategySpy).toHaveBeenCalled();
    });

    test('logout should call authentication strategy logout and emit a Logout event', () => {
      const emitSpy = jest.spyOn(service(EventService), 'emit');
      const testAuthStrategySpy = jest.spyOn(testAuthStrategy, 'logout');
      authService.logout();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(expect.any(Logout));
      expect(testAuthStrategySpy).toHaveBeenCalled();
    });
  });

  describe('without Authentication strategy set', () => {
    test('isAuthenticated should throw if no authentication strategy is set', () => {
      expect(() => authService.isAuthenticated()).toThrow();
    });

    test('login should throw if no authentication strategy is set', () => {
      expect(() => authService.login('username', 'password')).toThrow();
    });

    test('logout should throw if no authentication strategy is set', () => {
      expect(() => authService.logout()).toThrow();
    });
  });

  describe('isLoggedIn', () => {

    test('isLoggedIn should return true if security is enabled and user is logged in', () => {
      // Given, I have a security config with enabled security and user logged in
      const config = {enabled: true, userLoggedIn: true} as unknown as SecurityConfig;
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is logged in
      expect(authService.isLoggedIn()).toBe(true);
    });

    test('isLoggedIn should return false if there is no security config', () => {
      // Given, I have no security config
      const config = undefined;
      service(SecurityContextService).updateSecurityConfig(config as unknown as SecurityConfig);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });

    test('isLoggedIn should return false if security is disabled', () => {
      // Given, I have a security config with disabled security
      const config = {enabled: false, userLoggedIn: false} as unknown as SecurityConfig;
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });

    test('isLoggedIn should return false if security is enabled and user is not logged in', () => {
      // Given, I have a security config with enabled security and user not logged in
      const config = {enabled: true, userLoggedIn: false} as unknown as SecurityConfig;
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });
  });

  describe('isSecurityEnabled', () => {
    test('isSecurityEnabled should return true if security is enabled', () => {
      // Given, I have a security config with enabled security
      const config = {enabled: true} as unknown as SecurityConfig;
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is enabled
      expect(authService.isSecurityEnabled()).toBe(true);
    });

    test('isSecurityEnabled should return false if security is disabled', () => {
      // Given, I have a security config with disabled security
      const config = {enabled: false} as unknown as SecurityConfig;
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is disabled
      expect(authService.isSecurityEnabled()).toBe(false);
    });
  });
});
