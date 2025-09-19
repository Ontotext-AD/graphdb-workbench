import {TestUtil} from '../../../../services/utils/test/test-util';
import {AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {AuthenticatedUser} from '../../authenticated-user';
import {NoSecurityProvider} from '../no-security-provider';

describe('NoSecurityProvider', () => {
  let provider: NoSecurityProvider;
  let mockSecurityService: jest.Mocked<SecurityService>;
  let mockAuthStorageService: jest.Mocked<AuthenticationStorageService>;
  let mockSecurityContextService: jest.Mocked<SecurityContextService>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockedServices = TestUtil.mockServiceProvider();
    mockSecurityService = mockedServices[SecurityService.name] as jest.Mocked<SecurityService>;
    mockAuthStorageService = mockedServices[AuthenticationStorageService.name] as jest.Mocked<AuthenticationStorageService>;
    mockSecurityContextService = mockedServices[SecurityContextService.name] as jest.Mocked<SecurityContextService>;

    provider = new NoSecurityProvider();
  });

  describe('initialize', () => {
    it('should resolve immediately', async () => {
      await expect(provider.initialize()).resolves.toBeUndefined();
      expect(mockSecurityService.getAdminUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const mockAuthenticatedUser = new AuthenticatedUser({
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

    it('should clear token', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAuthenticatedUser);
      await provider.login();
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });

    it('should fetch and return admin user', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAuthenticatedUser);
      await expect(provider.login()).resolves.toBe(mockAuthenticatedUser);

      expect(mockSecurityService.getAdminUser).toHaveBeenCalled();
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });

    it('should update security context with user', async () => {
      mockSecurityService.getAdminUser.mockResolvedValue(mockAuthenticatedUser);
      await expect(provider.login()).resolves.toBe(mockAuthenticatedUser);
      expect(mockSecurityService.getAdminUser).toHaveBeenCalled();
      expect(mockSecurityContextService.updateAuthenticatedUser).toHaveBeenCalledWith(mockAuthenticatedUser);
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should resolve immediately', async () => {
      await expect(provider.logout()).resolves.toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true', () => {
      expect(provider.isAuthenticated()).toBe(true);
    });
  });
});
