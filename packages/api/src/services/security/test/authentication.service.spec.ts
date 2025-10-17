import {AuthenticationService} from '../authentication.service';
import {AuthenticatedUser, SecurityConfig} from '../../../models/security';
import {service, ServiceProvider} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {WindowService} from '../../window';
import {AuthStrategy, AuthStrategyType} from '../../../models/security/authentication';
import {AuthStrategyResolver} from '../auth-strategy-resolver';

class TestAuthStrategy implements AuthStrategy {
  type = AuthStrategyType.NO_SECURITY;

  initialize(): Promise<boolean> {
    return Promise.resolve(true);
  }

  isAuthenticated(): boolean {
    return true;
  }

  login(): Promise<AuthenticatedUser> {
    return Promise.resolve(new AuthenticatedUser());
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

}

const createSecurityConfig = (overrides?: Partial<SecurityConfig>): SecurityConfig => {
  const config = {
    enabled: true,
    passwordLoginEnabled: false,
    openIdEnabled: true,
    freeAccess: {},
    overrideAuth: {},
    ...overrides
  } as SecurityConfig;
  return new SecurityConfig(config);
};

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let testAuthStrategy: TestAuthStrategy;

  const securityContextService = service(SecurityContextService);
  const windowMock = {
    PluginRegistry: {
      get: jest.fn()
    },
    location: {
      pathname: '/home'
    },
    singleSpa: {
      navigateToUrl: jest.fn()
    }
  } as unknown as Window;

  beforeEach(() => {
    service(AuthenticationStorageService).remove('jwt');
    const securityConfig = createSecurityConfig();
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

    test('logout should call authentication strategy logout and emit a Logout event', async () => {
      const emitSpy = jest.spyOn(service(EventService), 'emit');
      const testAuthStrategySpy = jest.spyOn(testAuthStrategy, 'logout');
      await authService.logout();
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
    test('isLoggedIn should return true if security is enabled and user is logged in', async () => {
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(ServiceProvider.get(AuthStrategyResolver), 'resolveStrategy').mockReturnValue(testAuthStrategy);
      const config = createSecurityConfig({enabled: true});
      service(SecurityContextService).updateSecurityConfig(config);
      authService.setAuthenticationStrategy(config);
      // Given, I have a security config with enabled security and user logged in
      await authService.login('username', 'password');      // When, I check, user is logged in
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
      const config = createSecurityConfig({enabled: false});
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });

    test('isLoggedIn should return false if security is enabled and user is not logged in', () => {
      // Given, I have a security config with enabled security and user not logged in
      const config = createSecurityConfig({enabled: true});
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });
  });

  describe('isSecurityEnabled', () => {
    test('isSecurityEnabled should return true if security is enabled', () => {
      // Given, I have a security config with enabled security
      const config = createSecurityConfig({enabled: true});
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is enabled
      expect(authService.isSecurityEnabled()).toBe(true);
    });

    test('isSecurityEnabled should return false if security is disabled', () => {
      // Given, I have a security config with disabled security
      const config = createSecurityConfig({enabled: false});
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is disabled
      expect(authService.isSecurityEnabled()).toBe(false);
    });
  });
});
