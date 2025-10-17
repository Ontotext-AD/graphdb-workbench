import {SecurityService} from '../security.service';
import {AuthenticatedUser, AuthorityList, AuthSettingsResponseModel, SecurityConfig} from '../../../models/security';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {MapperProvider, ServiceProvider} from '../../../providers';
import {SecurityContextService} from '../security-context.service';
import {SecurityRestService} from '../security-rest.service';
import {AuthenticationStorageService} from '../authentication-storage.service';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {SecurityConfigMapper} from '../mappers/security-config.mapper';
import {AuthorityListMapper} from '../mappers/authority-list.mapper';
import {GrantedAuthoritiesUiModelMapper} from '../mappers/granted-authorities-ui-model.mapper';
import {AuthSettingsMapper} from '../mappers/auth-settings.mapper';
import {AuthSettings} from '../../../models/security/auth-settings';
import {BackendAuthoritiesMapper} from '../mappers/backend-authorities-mapper';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';

describe('SecurityService', () => {
  let securityService: SecurityService;
  let service: SecurityService;
  let restService: jest.Mocked<SecurityRestService>;
  let contextService: jest.Mocked<SecurityContextService>;
  let storageService: jest.Mocked<AuthenticationStorageService>;
  let configMapper: jest.Mocked<SecurityConfigMapper>;
  let userMapper: jest.Mocked<AuthenticatedUserMapper>;
  let authorityListMapper: jest.Mocked<AuthorityListMapper>;
  let grantedAuthoritiesUiModelMapper: jest.Mocked<GrantedAuthoritiesUiModelMapper>;
  // let authSettingsMapper: jest.Mocked<AuthSettingsMapper>;
  let backendAuthoritiesMapper: jest.Mocked<BackendAuthoritiesMapper>;
  let currentUser: AuthenticatedUser | undefined;

  beforeEach(() => {
    restService = { loginGdbToken: jest.fn(), updateUserData: jest.fn(), getSecurityConfig: jest.fn(), getAuthenticatedUser: jest.fn(), getFreeAccess: jest.fn(), setFreeAccess: jest.fn() } as never;
    contextService = {
      updateAuthenticatedUser: jest.fn((user: AuthenticatedUser) => {
        currentUser = user;
      }),
      getSecurityConfig: jest.fn(),
      getAuthenticatedUser: jest.fn(() => currentUser),
      updateSecurityConfig: jest.fn(),
    } as never;
    storageService = { setAuthToken: jest.fn() } as never;
    configMapper = { mapToModel: jest.fn() } as never;
    userMapper = { mapToModel: jest.fn() } as never;
    authorityListMapper = { mapToModel: jest.fn().mockReturnValue([]) } as never;
    grantedAuthoritiesUiModelMapper = { mapToModel: jest.fn().mockReturnValue([]) } as never;
    backendAuthoritiesMapper = { mapToModel: jest.fn().mockReturnValue([]) } as never;

    // @ts-expect-error svc and type incompatibility
    jest.spyOn(ServiceProvider, 'get').mockImplementation((svc: never) => {
      if (svc === SecurityRestService) {
        return restService;
      }
      if (svc === SecurityContextService) {
        return contextService;
      }
      if (svc === AuthenticationStorageService) {
        return storageService;
      }
      return null;
    });

    // @ts-expect-error mapper and type incompatibility
    jest.spyOn(MapperProvider, 'get').mockImplementation((mapper: never) => {
      if (mapper === SecurityConfigMapper) {
        return configMapper;
      }
      if (mapper === AuthenticatedUserMapper) {
        return userMapper;
      }
      if (mapper === AuthorityListMapper) {
        return authorityListMapper;
      }
      if (mapper === GrantedAuthoritiesUiModelMapper) {
        return grantedAuthoritiesUiModelMapper;
      }
      if (mapper === AuthSettingsMapper) {
        return new AuthSettingsMapper();
      }
      if (mapper === BackendAuthoritiesMapper) {
        return backendAuthoritiesMapper;
      }
      return null;
    });

    securityService = new SecurityService();
    service = securityService;
  });

  test('should update user data with new app settings', async () => {
    // Given the context service does not have an authenticated user
    expect(ServiceProvider.get(SecurityContextService).getAuthenticatedUser()).toBeUndefined();
    // And I create a mock authenticated user with updated app settings
    const updatedUser = new AuthenticatedUser({
      username: 'testuser',
      appSettings: {
        COOKIE_CONSENT: {
          statistics: true,
          thirdParty: false,
          updatedAt: 1738753714185
        }
      }
    });

    TestUtil.mockResponse(new ResponseMock('rest/security/users/testuser').setResponse({}));
    restService.updateUserData.mockResolvedValue(undefined);

    // When the service is called to update the user data
    await securityService.updateUserData(updatedUser);

    // Then the updated user should be in the context
    expect(ServiceProvider.get(SecurityContextService).getAuthenticatedUser()).toEqual(updatedUser);
  });

  describe('updateUserData', () => {
    it('should call restService.updateUserData and contextService.updateAuthenticatedUser', async () => {
      const user = {} as AuthenticatedUser;
      restService.updateUserData.mockResolvedValue(undefined);
      await securityService.updateUserData(user);
      expect(restService.updateUserData).toHaveBeenCalledWith(user);
      expect(contextService.updateAuthenticatedUser).toHaveBeenCalledWith(user);
    });
  });

  describe('getSecurityConfig', () => {
    it('should fetch and map securityConfig', async () => {
      const rawConfig = {} as SecurityConfig;
      const mappedConfig = {} as SecurityConfig;
      restService.getSecurityConfig.mockResolvedValue(rawConfig);
      configMapper.mapToModel.mockReturnValue(mappedConfig);

      const result = await service.getSecurityConfig();
      expect(restService.getSecurityConfig).toHaveBeenCalled();
      expect(configMapper.mapToModel).toHaveBeenCalledWith(rawConfig);
      expect(result).toBe(mappedConfig);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should fetch and map authenticated user', async () => {
      const rawUser = {} as AuthenticatedUser;
      const mappedUser = {} as AuthenticatedUser;
      restService.getAuthenticatedUser.mockResolvedValue(rawUser);
      userMapper.mapToModel.mockReturnValue(mappedUser);

      const result = await service.getAuthenticatedUser();
      expect(restService.getAuthenticatedUser).toHaveBeenCalled();
      expect(userMapper.mapToModel).toHaveBeenCalledWith(rawUser);
      expect(result).toBe(mappedUser);
    });
  });

  describe('getAdminUser', () => {
    it('should fetch and map admin user', async () => {
      const rawAdminUser = {} as AuthenticatedUser;
      const mappedAdminUser = {} as AuthenticatedUser;
      restService.getAdminUser = jest.fn().mockResolvedValue(rawAdminUser);
      userMapper.mapToModel.mockReturnValue(mappedAdminUser);

      const result = await service.getAdminUser();
      expect(restService.getAdminUser).toHaveBeenCalled();
      expect(userMapper.mapToModel).toHaveBeenCalledWith(rawAdminUser);
      expect(result).toBe(mappedAdminUser);
    });
  });

  describe('isPasswordLoginEnabled / isOpenIDEnabled', () => {
    it('should return flags from contextService.getSecurityConfig()', () => {
      contextService.getSecurityConfig.mockReturnValue({ passwordLoginEnabled: true, openIdEnabled: false } as never);
      expect(securityService.isPasswordLoginEnabled()).toBe(true);
      expect(service.isOpenIDEnabled()).toBe(false);
    });

    it('should return undefined if no config', () => {
      contextService.getSecurityConfig.mockReturnValue(undefined as never);
      expect(service.isPasswordLoginEnabled()).toBeFalsy();
      expect(service.isOpenIDEnabled()).toBeFalsy();
    });
  });

  describe('loginGdbToken', () => {
    it('should store token, update context and return mapped user when header present', async () => {
      const headers = new Headers({ authorization: 'token123' });
      const response = {
        body: {} as AuthenticatedUser,
        status: 200,
        headers,
        ok: true,
        json: jest.fn(),
      } as unknown as Response;
      restService.loginGdbToken.mockResolvedValue(response);
      const mappedUser = {} as AuthenticatedUser;
      userMapper.mapToModel.mockReturnValue(mappedUser);

      await service.loginGdbToken('u', 'p');
      expect(restService.loginGdbToken).toHaveBeenCalledWith('u', 'p');
    });
  });

  describe('getFreeAccess', () => {
    it('should fetch and map free access settings', async () => {
      // Given, I have raw free access data from the backend
      const rawFreeAccess = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: { theme: 'dark' }
      };
      const mappedFreeAccess = new AuthSettings({
        enabled: true,
        authorities: new AuthorityList(['ROLE_USER']),
        appSettings: { theme: 'dark' }
      });

      restService.getFreeAccess.mockResolvedValue(rawFreeAccess);

      // When, I call getFreeAccess
      const result = await service.getFreeAccess();

      // Then, I expect the rest service to be called and response to be mapped
      expect(restService.getFreeAccess).toHaveBeenCalled();
      expect(result).toEqual(mappedFreeAccess);
    });
  });

  describe('setFreeAccess', () => {
    it('should set free access with authorities and app settings when enabled', async () => {
      // Given, I have free access settings to enable
      const enabled = true;
      const freeAccess = new AuthSettings({
        enabled: true,
        authorities: new AuthorityList(['ROLE_USER']),
        appSettings: { theme: 'light' }
      });
      const mappedAuthorities = ['ROLE_USER'];
      const updatedSecurityConfig = SecurityConfigTestUtil.createSecurityConfig({ enabled: true });

      backendAuthoritiesMapper.mapToModel.mockReturnValue(mappedAuthorities);
      restService.setFreeAccess.mockResolvedValue({} as unknown as AuthSettingsResponseModel);
      restService.getSecurityConfig.mockResolvedValue(updatedSecurityConfig);
      configMapper.mapToModel.mockReturnValue(updatedSecurityConfig);

      // When, I call setFreeAccess with enabled true and settings
      await service.setFreeAccess(enabled, freeAccess);

      // Then, I expect the rest service to be called with correct data
      expect(restService.setFreeAccess).toHaveBeenCalledWith({
        enabled: true,
        authorities: mappedAuthorities,
        appSettings: { theme: 'light' }
      });
      expect(restService.getSecurityConfig).toHaveBeenCalled();
      expect(contextService.updateSecurityConfig).toHaveBeenCalledWith(updatedSecurityConfig);
    });

    it('should set free access without authorities when disabled', async () => {
      // Given, I want to disable free access
      const enabled = false;
      const updatedSecurityConfig = SecurityConfigTestUtil.createSecurityConfig({ enabled: true });

      restService.setFreeAccess.mockResolvedValue({} as unknown as AuthSettingsResponseModel);
      restService.getSecurityConfig.mockResolvedValue(updatedSecurityConfig);
      configMapper.mapToModel.mockReturnValue(updatedSecurityConfig);

      // When, I call setFreeAccess with enabled false
      await service.setFreeAccess(enabled);

      // Then, I expect the rest service to be called with only enabled flag
      expect(restService.setFreeAccess).toHaveBeenCalledWith({
        enabled: false
      });
      expect(backendAuthoritiesMapper.mapToModel).not.toHaveBeenCalled();
      expect(restService.getSecurityConfig).toHaveBeenCalled();
      expect(contextService.updateSecurityConfig).toHaveBeenCalledWith(updatedSecurityConfig);
    });

    it('should handle enabling free access without optional settings', async () => {
      // Given, I want to enable free access but provide no additional settings
      const enabled = true;
      const updatedSecurityConfig = SecurityConfigTestUtil.createSecurityConfig({ enabled: true });

      backendAuthoritiesMapper.mapToModel.mockReturnValue([]);
      restService.setFreeAccess.mockResolvedValue({} as unknown as AuthSettingsResponseModel);
      restService.getSecurityConfig.mockResolvedValue(updatedSecurityConfig);
      configMapper.mapToModel.mockReturnValue(updatedSecurityConfig);

      // When, I call setFreeAccess with enabled true but no freeAccess object
      await service.setFreeAccess(enabled);

      // Then, I expect the rest service to be called with enabled and empty authorities
      expect(restService.setFreeAccess).toHaveBeenCalledWith({
        enabled: true,
        authorities: [],
        appSettings: undefined
      });
      expect(restService.getSecurityConfig).toHaveBeenCalled();
      expect(contextService.updateSecurityConfig).toHaveBeenCalledWith(updatedSecurityConfig);
    });
  });
});
