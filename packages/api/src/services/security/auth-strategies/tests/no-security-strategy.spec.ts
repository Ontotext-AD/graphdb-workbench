import {NoSecurityStrategy} from '../no-security-strategy';
import {TestUtil} from '../../../../services/utils/test/test-util';
import {ResponseMock} from '../../../../services/http/test/response-mock';
import {ServiceProvider} from '../../../../providers';
import {SecurityContextService, SecurityService} from '../../../../services/security';
import {ProviderResponseMocks} from './provider-response-mocks';
import {AuthenticatedUser} from '../../../../models/security';

describe('NoSecurityProvider', () => {
  let strategy: NoSecurityStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    TestUtil.restoreAllMocks();

    ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(undefined as unknown as AuthenticatedUser);

    strategy = new NoSecurityStrategy();
  });

  describe('initialize', () => {
    it('should fetch the admin user and update the context', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/security/users/admin').setResponse(ProviderResponseMocks.adminUserResponse));

      const getAdminUserSpy = jest.spyOn(ServiceProvider.get(SecurityService), 'getAuthenticatedAdminUser');
      const updateAuthenticatedUserSpy = jest.spyOn(ServiceProvider.get(SecurityContextService), 'updateAuthenticatedUser');

      await strategy.initialize();
      expect(getAdminUserSpy).toHaveBeenCalled();
      expect(updateAuthenticatedUserSpy).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should resolve', async () => {
      await expect(strategy.login()).resolves.toBeTruthy();
    });
  });

  describe('logout', () => {
    it('should resolve immediately', async () => {
      await expect(strategy.logout()).resolves.toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if there is an authenticated user', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/security/users/admin').setResponse(ProviderResponseMocks.adminUserResponse));

      await strategy.initialize();
      expect(strategy.isAuthenticated()).toBe(true);
    });

    it('should return false if there is no authenticated user', () => {
      expect(strategy.isAuthenticated()).toBe(false);
    });
  });
});
