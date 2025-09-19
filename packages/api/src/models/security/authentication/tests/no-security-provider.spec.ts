import {TestUtil} from '../../../../services/utils/test/test-util';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {AuthenticatedUser} from '../../authenticated-user';
import {NoSecurityProvider} from '../no-security-provider';

describe('NoSecurityProvider', () => {
  let provider: NoSecurityProvider;
  let mockSecurityService: jest.Mocked<SecurityService>;
  let mockAuthStorageService: jest.Mocked<AuthenticationStorageService>;
  let mockSecurityContextService: jest.Mocked<SecurityContextService>;

  const mockAdminUser = new AuthenticatedUser({
    username: 'testuser',
    appSettings: {
      COOKIE_CONSENT: {
        policyAccepted: false,
        statistics: true,
        thirdParty: false,
        updatedAt: 1738753714185
      }
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedServices = TestUtil.mockServiceProvider();
    mockSecurityService = mockedServices[SecurityService.name] as jest.Mocked<SecurityService>;
    mockAuthStorageService = mockedServices[AuthenticationStorageService.name] as jest.Mocked<AuthenticationStorageService>;
    mockSecurityContextService = mockedServices[SecurityContextService.name] as jest.Mocked<SecurityContextService>;

    provider = new NoSecurityProvider();
  });

  describe('initialize', () => {
    it('should fetch the admin user and update the context', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAdminUser);
      await provider.initialize();
      expect(mockSecurityService.getAdminUser).toHaveBeenCalled();
      expect(mockSecurityContextService.updateAuthenticatedUser).toHaveBeenCalledWith(mockAdminUser);
    });
  });

  describe('login', () => {
    it('should clear token', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAdminUser);
      await provider.login();
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });

    it('should fetch and return admin user', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAdminUser);
      await expect(provider.login()).resolves.toBe(mockAdminUser);

      expect(mockSecurityService.getAdminUser).toHaveBeenCalled();
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });

    it('should update security context with user', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAdminUser);
      await expect(provider.login()).resolves.toBe(mockAdminUser);
      expect(mockSecurityService.getAdminUser).toHaveBeenCalled();
      expect(mockSecurityContextService.updateAuthenticatedUser).toHaveBeenCalledWith(mockAdminUser);
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should resolve immediately', async () => {
      await expect(provider.logout()).resolves.toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if there is an authenticated user', () => {
      mockSecurityContextService.getAuthenticatedUser.mockReturnValue(mockAdminUser);
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return false if there is no authenticated user', () => {
      mockSecurityContextService.getAuthenticatedUser.mockReturnValue(undefined);
      expect(provider.isAuthenticated()).toBe(false);
    });
  });
});
