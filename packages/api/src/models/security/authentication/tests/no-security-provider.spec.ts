import {NoSecurityProvider} from '../no-security-provider';
import {TestUtil} from '../../../../services/utils/test/test-util';
import {ResponseMock} from '../../../../services/http/test/response-mock';
import {ServiceProvider} from '../../../../providers';
import {SecurityContextService, SecurityService} from '../../../../services/security';
import {AuthenticatedUser} from '../../authenticated-user';
import {ProviderResponseMocks} from './provider-response-mocks';

describe('NoSecurityProvider', () => {
  let provider: NoSecurityProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    TestUtil.restoreAllMocks();

    ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);

    provider = new NoSecurityProvider();
  });

  describe('initialize', () => {
    it('should fetch the admin user and update the context', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/security/users/admin').setResponse(ProviderResponseMocks.adminUserResponse));

      const getAdminUserSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'getAdminUser');
      const updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');

      await provider.initialize();
      expect(getAdminUserSpy).toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should resolve', async () => {
      await expect(provider.login()).resolves.toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should resolve immediately', async () => {
      await expect(provider.logout()).resolves.toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if there is an authenticated user', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/security/users/admin').setResponse(ProviderResponseMocks.adminUserResponse));

      await provider.initialize();
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return false if there is no authenticated user', () => {
      expect(provider.isAuthenticated()).toBe(false);
    });
  });
});
