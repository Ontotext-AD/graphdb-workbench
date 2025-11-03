import {TestUtil} from '../../../utils/test/test-util';
import {GdbTokenAuthStrategy} from '../gdb-token-auth-strategy';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {ServiceProvider} from '../../../../providers';
import {WindowService} from '../../../window';
import {ResponseMock} from '../../../http/test/response-mock';
import {ProviderResponseMocks} from './provider-response-mocks';
import {AuthenticatedUser, SecurityConfig} from '../../../../models/security';

describe('GdbTokenAuthStrategy', () => {
  let strategy : GdbTokenAuthStrategy;
  let authenticationStorageService: AuthenticationStorageService;

  beforeEach(() => {
    TestUtil.restoreAllMocks();
    jest.clearAllMocks();

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

      beforeEach(() => {
        TestUtil.mockResponse(new ResponseMock('rest/security/authenticated-user').setResponse(ProviderResponseMocks.authenticatedUserResponse));

        getAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'getAuthenticatedUser');
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
