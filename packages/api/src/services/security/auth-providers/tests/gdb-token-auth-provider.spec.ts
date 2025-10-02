import {TestUtil} from '../../../utils/test/test-util';
import {GdbTokenAuthProvider} from '../gdb-token-auth-provider';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {ServiceProvider} from '../../../../providers';
import {WindowService} from '../../../window';
import {ResponseMock} from '../../../http/test/response-mock';
import {LoggerProvider} from '../../../logging/logger-provider';
import {ProviderResponseMocks} from './provider-response-mocks';
import {AuthenticatedUser, SecurityConfig} from '../../../../models/security';

describe('GdbTokenAuthProvider', () => {
  let provider: GdbTokenAuthProvider;
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

    provider = new GdbTokenAuthProvider();
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

        await expect(provider.initialize()).resolves.toEqual(false);
        expect(getAuthenticatedUserSpy).not.toHaveBeenCalled();
      });

      it('should resolve immediately false if current route is not login and there is no auth', async () => {
        jest.spyOn(WindowService, 'getWindow').mockReturnValue({
          location: {
            pathname: '/login'
          },
          PluginRegistry: {get: jest.fn(() => [])}
        } as unknown as Window);

        await expect(provider.initialize()).resolves.toEqual(false);
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

        await provider.initialize();
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

        await provider.initialize();
        expect(loggerErrorSpy).toHaveBeenCalledWith('Could not load authenticated user', expect.anything());

        expect(getAuthenticatedUserSpy).toHaveBeenCalled();
        expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('login', () => {
    let updateAuthenticatedUserSpy: jest.SpyInstance;
    let setAuthTokenSpy: jest.SpyInstance;
    let loginGdbTokenSpy: jest.SpyInstance;

    const loginData = {username: 'testUser', password: '1234'};

    beforeEach(() => {
      updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');
      setAuthTokenSpy = jest.spyOn(ServiceProvider.get(AuthenticationStorageService), 'setAuthToken');
      loginGdbTokenSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'loginGdbToken');
    });

    it('should login, set token, update user', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse(ProviderResponseMocks.loginResponse).setHeaders(new Headers({authorization: 'GDB someToken'})));

      const result = await provider.login(loginData);
      expect(result).toBeUndefined();

      expect(loginGdbTokenSpy).toHaveBeenCalledWith(loginData.username, loginData.password);
      expect(setAuthTokenSpy).toHaveBeenCalledWith('GDB someToken');
      expect(updateAuthenticatedUserSpy).toHaveBeenCalled();
    });

    it('should throw if user mapping fails', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse('errorLogin').setSetThrowOnJson(true));

      await expect(provider.login(loginData)).rejects.toThrow('Failed to map user from response');
      expect(loggerErrorSpy).toHaveBeenCalledWith('Could not map user from response', expect.any(Error));
    });

    it('should not set token/user if auth header or user is missing', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/login').setResponse(ProviderResponseMocks.loginResponse));

      await provider.login(loginData);
      expect(setAuthTokenSpy).not.toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the auth token', async () => {
      const clearAuthTokenSpy = jest.spyOn(ServiceProvider.get(AuthenticationStorageService), 'clearAuthToken');
      await provider.logout();
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

      await provider.login({username: 'testUser', password: '1234'});
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return false if token is null', () => {
      expect(provider.isAuthenticated()).toBe(false);
    });
  });
});
