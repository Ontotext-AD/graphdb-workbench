import {TestUtil} from '../../../../services/utils/test/test-util';
import {GdbTokenAuthProvider} from '../gdb-token-auth-provider';
import {AuthenticatedUserMapper, AuthenticationService, AuthenticationStorageService, SecurityContextService, SecurityService} from '../../../../services/security';
import {ConfigurationContextService} from '../../../../services/configuration/configuration-context.service';
import {MapperProvider} from '../../../../providers';
import {LogLevel} from '../../../logging/log-level';
import {LoggerType} from '../../../logging/logger-type';
import {AuthenticatedUser} from '../../authenticated-user';
import {SecurityConfig} from '../../security-config';
import {StorageData} from '../../../storage';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mockResponse(headers: any, jsonData: any) {
  return {
    headers: {get: (key: any) => headers[key] || null},
    json: jest.fn().mockResolvedValue(jsonData)
  };
}

describe('GdbTokenAuthProvider', () => {
  let provider: GdbTokenAuthProvider;
  let mockSecurityService: jest.Mocked<SecurityService>;
  let mockAuthStorageService: jest.Mocked<AuthenticationStorageService>;
  let mockSecurityContextService: jest.Mocked<SecurityContextService>;
  let mockAuthenticatedUserMapper: jest.Mocked<AuthenticatedUserMapper>;
  let mockConfigurationContextService: jest.Mocked<ConfigurationContextService>;
  let mockAuthenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthenticatedUserMapper = {
      mapToModel: jest.fn()
    };

    const mockedServices = TestUtil.mockServiceProvider();
    mockSecurityService = mockedServices[SecurityService.name] as jest.Mocked<SecurityService>;
    mockConfigurationContextService = mockedServices[ConfigurationContextService.name] as jest.Mocked<ConfigurationContextService>;
    mockAuthStorageService = mockedServices[AuthenticationStorageService.name] as jest.Mocked<AuthenticationStorageService>;
    mockSecurityContextService = mockedServices[SecurityContextService.name] as jest.Mocked<SecurityContextService>;
    mockAuthenticationService = mockedServices[AuthenticationService.name] as jest.Mocked<AuthenticationService>;

    jest.spyOn(MapperProvider, 'get').mockReturnValue(mockAuthenticatedUserMapper);
    mockConfigurationContextService.getApplicationConfiguration.mockReturnValue({
      pluginsManifestPath: 'wb-plugins/plugins-manifest.json',
      loggerConfig: {
        minLogLevel: LogLevel.DEBUG,
        loggers: [LoggerType.CONSOLE]
      }
    });
    jest.spyOn(console, 'error').mockImplementation();

    provider = new GdbTokenAuthProvider();
  });

  describe('initialize', () => {
    it('should resolve immediately if current route is login', async () => {
      const privateSpy = jest.spyOn<any, any>(provider, 'isCurrentRouteLogin');
      privateSpy.mockReturnValue(true);
      await expect(provider.initialize()).resolves.toBeUndefined();
      expect(mockSecurityService.getAuthenticatedUser).not.toHaveBeenCalled();
    });

    it('should update authenticated user if not on login route', async () => {
      const privateSpy = jest.spyOn<any, any>(provider, 'isCurrentRouteLogin');
      privateSpy.mockReturnValue(false);
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
      mockSecurityService.getAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
      await provider.initialize();
      expect(mockSecurityContextService.updateAuthenticatedUser).toHaveBeenCalledWith(mockAuthenticatedUser);
    });

    it('should handle errors from getAuthenticatedUser', async () => {
      const privateSpy = jest.spyOn<any, any>(provider, 'isCurrentRouteLogin');
      privateSpy.mockReturnValue(false);
      mockSecurityService.getAuthenticatedUser.mockRejectedValue(new Error('fail'));
      const loggerSpy = jest.spyOn(provider['logger'], 'error');
      await provider.initialize();
      expect(loggerSpy).toHaveBeenCalledWith('Could not load authenticated user', expect.any(Error));
      loggerSpy.mockRestore();
    });
  });

  describe('login', () => {
    const loginData = {username: 'u', password: 'p'};
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
    const token = 'Bearer token';

    it('should login, set token, update user, and return user', async () => {
      const response = mockResponse({authorization: token}, {mockAuthenticatedUser}) as any;
      mockSecurityService.loginGdbToken.mockResolvedValue(response);
      mockAuthenticatedUserMapper.mapToModel.mockReturnValue(mockAuthenticatedUser);
      const result = await provider.login(loginData);
      expect(mockSecurityService.loginGdbToken).toHaveBeenCalledWith('u', 'p');
      expect(mockAuthStorageService.setAuthToken).toHaveBeenCalledWith(token);
      expect(mockSecurityContextService.updateAuthenticatedUser).toHaveBeenCalledWith(mockAuthenticatedUser);
      expect(result).toBe(mockAuthenticatedUser);
    });

    it('should throw if user mapping fails', async () => {
      const loggerSpy = jest.spyOn(provider['logger'], 'error');
      const response = mockResponse({authorization: token}, 'mockAuthenticatedUser') as any;
      mockSecurityService.loginGdbToken.mockResolvedValue(response);
      mockAuthenticatedUserMapper.mapToModel.mockImplementation(() => {
        throw new Error('bad map');
      });
      await expect(provider.login(loginData)).rejects.toThrow('Failed to map user from response');
      expect(loggerSpy).toHaveBeenCalledWith('Could not map user from response', expect.any(Error));
      loggerSpy.mockRestore();
    });

    it('should not set token/user if auth header or user is missing', async () => {
      const response = mockResponse({}, {mockAuthenticatedUser}) as any;
      mockSecurityService.loginGdbToken.mockResolvedValue(response);
      mockAuthenticatedUserMapper.mapToModel.mockReturnValue(mockAuthenticatedUser);
      await provider.login(loginData);
      expect(mockAuthStorageService.setAuthToken).not.toHaveBeenCalled();
      expect(mockSecurityContextService.updateAuthenticatedUser).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear the auth token', async () => {
      await provider.logout();
      expect(mockAuthStorageService.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if security is disabled', () => {
      const securityConfig = {
        enabled: false,
      } as unknown as SecurityConfig;

      mockSecurityContextService.getSecurityConfig.mockReturnValue(securityConfig);
      mockAuthStorageService.getAuthToken.mockReturnValue({getValue: () => null} as unknown as StorageData);
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return true if token exists', () => {
      const securityConfig = {
        enabled: true,
      } as unknown as SecurityConfig;

      mockSecurityContextService.getSecurityConfig.mockReturnValue(securityConfig);
      mockAuthStorageService.getAuthToken.mockReturnValue({getValue: () => 'token'} as unknown as StorageData);
      expect(provider.isAuthenticated()).toBe(true);
    });

    it('should return false if security is enabled and token is null', () => {
      mockAuthenticationService.isSecurityEnabled.mockReturnValue(true);
      mockAuthStorageService.getAuthToken.mockReturnValue({getValue: () => null} as unknown as StorageData);
      expect(provider.isAuthenticated()).toBe(false);
    });
  });
});
