import {AuthenticationService} from '../authentication.service';
import {AuthenticatedUser, SecurityConfig} from '../../../models/security';
import {service} from '../../../providers';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {SecurityContextService} from '../security-context.service';
import {EventService} from '../../event-service';
import {Logout} from '../../../models/events';
import {WindowService} from '../../window';
import {AuthStrategy, AuthStrategyType} from '../../../models/security/authentication';
import {AuthStrategyResolver} from '../auth-strategy-resolver';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';
import {NavigationContextService} from '../../navigation';
import {getPathName, isLoginPage} from '../../utils';

jest.mock('../../utils/routing-utils', () => ({
  ...(jest.requireActual('../../utils/routing-utils')),
  getPathName: jest.fn(),
  isLoginPage: jest.fn(() => false)
}));

class TestAuthStrategy implements AuthStrategy {
  type = AuthStrategyType.NO_SECURITY;

  initialize(): Promise<boolean> {
    return Promise.resolve(true);
  }

  isAuthenticated(): boolean {
    return true;
  }

  fetchAuthenticatedUser(): Promise<AuthenticatedUser> {
    return Promise.resolve(new AuthenticatedUser());
  }

  login(): Promise<AuthenticatedUser> {
    return Promise.resolve(new AuthenticatedUser());
  }

  logout(): Promise<void> {
    return Promise.resolve();
  }

  isExternal(): boolean {
    return false;
  }
}

const getSecurityConfig = (securityEnabled: boolean) => {
  return SecurityConfigTestUtil.createSecurityConfig({enabled: securityEnabled});
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
    getLocationPathname: jest.fn(),
    singleSpa: {
      navigateToUrl: jest.fn()
    }
  } as unknown as Window;

  beforeEach(() => {
    service(AuthenticationStorageService).remove('jwt');
    const securityConfig = getSecurityConfig(true);
    securityContextService.updateSecurityConfig(securityConfig);
    securityContextService.updateIsLoggedIn(false);
    jest.spyOn(WindowService, 'getWindow').mockReturnValue(windowMock);
    jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(undefined);

    authService = new AuthenticationService();
  });

  describe('with Authentication strategy set', () => {
    beforeEach(() => {
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
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

    test('should store returnUrl on logout if not on login page', async () => {
      const navigationContextService = service(NavigationContextService);
      jest.spyOn(navigationContextService, 'updateReturnUrl');
      (getPathName as jest.Mock).mockReturnValue('/sparql');
      await authService.logout();
      expect(navigationContextService.updateReturnUrl).toHaveBeenCalledWith('/sparql');
    });

    test('should not store returnUrl on logout if on login page', async () => {
      const navigationContextService = service(NavigationContextService);
      jest.spyOn(navigationContextService, 'updateReturnUrl');
      (isLoginPage as jest.Mock).mockReturnValue(true);
      await authService.logout();
      expect(navigationContextService.updateReturnUrl).not.toHaveBeenCalled();
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
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      const config = getSecurityConfig(true);
      service(SecurityContextService).updateSecurityConfig(config);
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
      const config = getSecurityConfig(false);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });

    test('isLoggedIn should return false if security is enabled and user is not logged in', () => {
      // Given, I have a security config with enabled security and user not logged in
      const config = getSecurityConfig(true);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, user is not logged in
      expect(authService.isLoggedIn()).toBe(false);
    });
  });

  describe('isSecurityEnabled', () => {
    test('isSecurityEnabled should return true if security is enabled', () => {
      // Given, I have a security config with enabled security
      const config = getSecurityConfig(true);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is enabled
      expect(authService.isSecurityEnabled()).toBe(true);
    });

    test('isSecurityEnabled should return false if security is disabled', () => {
      // Given, I have a security config with disabled security
      const config = getSecurityConfig(false);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check, security is disabled
      expect(authService.isSecurityEnabled()).toBe(false);
    });
  });

  describe('isAuthenticationStrategySet', () => {
    test('should return false when authentication strategy is not set', () => {
      // Given, I have not set an authentication strategy
      // When, I check if strategy is set
      expect(authService.isAuthenticationStrategySet()).toBe(false);
    });

    test('should return true when authentication strategy is set', async () => {
      // Given, I set an authentication strategy
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      // When, I check if strategy is set
      expect(authService.isAuthenticationStrategySet()).toBe(true);
    });
  });

  describe('isExternalUser', () => {
    test('should return false when user is not logged in', async () => {
      // Given, I have a user that is not logged in
      const config = getSecurityConfig(true);
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check if user is external
      expect(authService.isExternalUser()).toBe(false);
    });

    test('should return false when user is logged in with a token', async () => {
      // Given, I have a user logged in with a token
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      service(AuthenticationStorageService).set('jwt', 'test-token');
      await authService.login('username', 'password');
      // When, I check if user is external
      expect(authService.isExternalUser()).toBe(false);
    });

    test('should return true when user is logged in without a token', async () => {
      // Given, I have a user logged in without a token (external auth)
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(testAuthStrategy, 'isExternal').mockReturnValue(true);
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      await authService.login('username', 'password');
      // When, I check if user is external
      expect(authService.isExternalUser()).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when security is disabled', async () => {
      // Given, I have security disabled
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      const config = getSecurityConfig(false);
      service(SecurityContextService).updateSecurityConfig(config);
      // When, I check if user is authenticated
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should return true when user is external', async () => {
      // Given, I have an external user (logged in without token)
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      await authService.login('username', 'password');
      // When, I check if user is authenticated
      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should return true when authentication strategy confirms authentication', async () => {
      // Given, authentication strategy returns true for isAuthenticated
      testAuthStrategy = new TestAuthStrategy();
      jest.spyOn(testAuthStrategy, 'isAuthenticated').mockReturnValue(true);
      jest.spyOn(service(AuthStrategyResolver), 'getAuthStrategy').mockReturnValue(testAuthStrategy);
      // When, I check if user is authenticated
      expect(authService.isAuthenticated()).toBe(true);
    });
  });
});
