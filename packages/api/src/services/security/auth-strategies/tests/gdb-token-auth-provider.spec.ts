import {TestUtil} from '../../../utils/test/test-util';
import {GdbTokenAuthStrategy} from '../gdb-token-auth-strategy';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {ServiceProvider} from '../../../../providers';
import {WindowService} from '../../../window';
import {ResponseMock} from '../../../http/test/response-mock';
import {LoggerProvider} from '../../../logging/logger-provider';
import {ProviderResponseMocks} from './provider-response-mocks';
import {AuthenticatedUser, SecurityConfig} from '../../../../models/security';

describe('GdbTokenAuthStrategy', () => {
  let strategy : GdbTokenAuthStrategy;
  let loggerErrorSpy: jest.SpyInstance;
  let authenticationStorageService: AuthenticationStorageService;

  beforeEach(() => {
    TestUtil.restoreAllMocks();
    jest.clearAllMocks();
    loggerErrorSpy = jest.spyOn(LoggerProvider.logger, 'error');

    const securityContextService = ServiceProvider.get(SecurityContextService);
    securityContextService.updateSecurityConfig(undefined as unknown as SecurityConfig);
    securityContextService.updateAuthToken(undefined as unknown as string);
    securityContextService.updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);
    authenticationStorageService = ServiceProvider.get(AuthenticationStorageService);
    authenticationStorageService.clearAuthToken();

    strategy = new GdbTokenAuthStrategy();
  });

  describe('initialize', () => {
    describe('when authenticated user returns', () => {
      let getAuthenticatedUserSpy: jest.SpyInstance;
      let updateAuthenticatedUserSpy: jest.SpyInstance;

      beforeEach(() => {
        TestUtil.mockResponse(new ResponseMock('rest/security/authenticated-user').setResponse(ProviderResponseMocks.authenticatedUserResponse));

        getAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'getAuthenticatedUser');
        updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');
      });

      it('should resolve immediately false if current route is login and there is no auth', async () => {
        jest.spyOn(WindowService, 'getWindow').mockReturnValue({
          location: {
            pathname: '/login'
          },
          PluginRegistry: {get: jest.fn(() => [])}
        } as unknown as Window);

        await expect(strategy.initialize()).resolves.toEqual(false);
        expect(getAuthenticatedUserSpy).not.toHaveBeenCalled();
      });

      it('should resolve immediately false if current route is not login and there is no auth', async () => {
        jest.spyOn(WindowService, 'getWindow').mockReturnValue({
          location: {
            pathname: '/login'
          },
          PluginRegistry: {get: jest.fn(() => [])}
        } as unknown as Window);

        await expect(strategy.initialize()).resolves.toEqual(false);
        expect(getAuthenticatedUserSpy).not.toHaveBeenCalled();
      });

      it('should update authenticated user if not on login route and authentication is valid', async () => {
        authenticationStorageService.setAuthToken('valid-token');
        jest.spyOn(WindowService, 'getWindow').mockReturnValue({
          location: {
            pathname: '/home'
          },
          PluginRegistry: {get: jest.fn(() => [])}
        } as unknown as Window);

        await strategy.initialize();
        expect(getAuthenticatedUserSpy).toHaveBeenCalled();
        expect(updateAuthenticatedUserSpy).toHaveBeenCalled();
      });
    });

    describe('when authenticated user returns 401', () => {
      let getAuthenticatedUserSpy: jest.SpyInstance;
      let updateAuthenticatedUserSpy: jest.SpyInstance;

      beforeEach(() => {
        TestUtil.mockResponse(new ResponseMock('rest/security/authenticated-user').setStatus(401));
        getAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'getAuthenticatedUser');
        updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');
      });

      it('should handle errors from getAuthenticatedUser', async () => {
        authenticationStorageService.setAuthToken('valid-token');
        jest.spyOn(WindowService, 'getWindow').mockReturnValue({
          location: {
            pathname: '/home'
          },
          PluginRegistry: {get: jest.fn(() => [])}
        } as unknown as Window);

        await strategy.initialize();
        expect(loggerErrorSpy).toHaveBeenCalledWith('Could not load authenticated user', expect.anything());

        expect(getAuthenticatedUserSpy).toHaveBeenCalled();
        expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should clear the auth token', async () => {
      const clearAuthTokenSpy = jest.spyOn(ServiceProvider.get(AuthenticationStorageService), 'clearAuthToken');
      await strategy.logout();
      expect(clearAuthTokenSpy).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      const securityConfig = {
        enabled: true
      } as unknown as SecurityConfig;
      ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfig);
    });

    it('should return true if token exists', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse(ProviderResponseMocks.loginResponse).setHeaders(new Headers({authorization: 'GDB someToken'})));

      await strategy.login({username: 'testUser', password: '1234'});
      expect(strategy.isAuthenticated()).toBe(true);
    });

    it('should return false if token is null', () => {
      expect(strategy.isAuthenticated()).toBe(false);
    });
  });
});
