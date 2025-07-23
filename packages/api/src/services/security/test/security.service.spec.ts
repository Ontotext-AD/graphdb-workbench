import {SecurityService} from '../security.service';
import {AuthenticatedUser, SecurityConfig} from '../../../models/security';
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
  let currentUser: AuthenticatedUser | undefined;

  beforeEach(() => {
    restService = { login: jest.fn(), updateUserData: jest.fn(), getSecurityConfig: jest.fn(), getAuthenticatedUser: jest.fn() } as never;
    contextService = {
      updateAuthenticatedUser: jest.fn((user: AuthenticatedUser) => {
        currentUser = user;
      }),
      getSecurityConfig: jest.fn(),
      getAuthenticatedUser: jest.fn(() => currentUser),
    } as never;
    storageService = { setAuthToken: jest.fn() } as never;
    configMapper = { mapToModel: jest.fn() } as never;
    userMapper = { mapToModel: jest.fn() } as never;
    authorityListMapper = { mapToModel: jest.fn().mockReturnValue([]) } as never;
    grantedAuthoritiesUiModelMapper = { mapToModel: jest.fn().mockReturnValue([]) } as never;

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

  describe('login', () => {
    it('should store token, update context and return mapped user when header present', async () => {
      const headers = new Headers({ authorization: 'token123' });
      const response = {
        body: {} as AuthenticatedUser,
        status: 200,
        headers,
        ok: true,
        json: jest.fn(),
      } as unknown as Response;
      restService.login.mockResolvedValue(response);
      const mappedUser = {} as AuthenticatedUser;
      userMapper.mapToModel.mockReturnValue(mappedUser);

      const result = await service.login('u', 'p');
      expect(restService.login).toHaveBeenCalledWith('u', 'p');
      expect(storageService.setAuthToken).toHaveBeenCalledWith('token123');
      const responseBody = await response.json();
      expect(userMapper.mapToModel).toHaveBeenCalledWith(responseBody);
      expect(contextService.updateAuthenticatedUser).toHaveBeenCalledWith(mappedUser);
      expect(result).toBe(mappedUser);
    });

    it('should not store token when header missing', async () => {
      const headers = new Headers();
      const mockResponse = {
        body: {} as AuthenticatedUser,
        status: 200,
        headers,
        ok: true,
        json: jest.fn(),
      } as unknown as Response;

      restService.login.mockResolvedValue(mockResponse);

      const mappedUser = {} as AuthenticatedUser;
      userMapper.mapToModel.mockReturnValue(mappedUser);

      const result = await service.login('u', 'p');
      expect(storageService.setAuthToken).not.toHaveBeenCalled();
      expect(contextService.updateAuthenticatedUser).toHaveBeenCalledWith(mappedUser);
      expect(result).toBe(mappedUser);
    });
  });
});
