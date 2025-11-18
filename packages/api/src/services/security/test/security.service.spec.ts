import {SecurityService} from '../security.service';
import {AuthenticatedUser, AuthorityList, SecurityConfig, SecurityConfigResponse} from '../../../models/security';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {service, ServiceProvider} from '../../../providers';
import {SecurityContextService} from '../security-context.service';
import {SecurityRestService} from '../security-rest.service';
import {AuthenticatedUserMapper} from '../mappers/authenticated-user.mapper';
import {AuthSettingsMapper} from '../mappers/auth-settings.mapper';
import {AuthSettings} from '../../../models/security/auth-settings';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';
import {AppSettings} from '../../../models/users/app-settings';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';
import {UsersService} from '../../users';
import {AuthenticationService} from '../authentication.service';
import {ProviderResponseMocks} from '../auth-strategies/tests/provider-response-mocks';
import {UserResponseMapper} from '../../users/user-response.mapper';
import {CookieConsent} from '../../../models/cookie';
import {AuthStrategyResolver} from '../auth-strategy-resolver';
import {SecurityConfigMapper} from '../mappers/security-config.mapper';

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    securityService = new SecurityService();
  });

  afterEach(() => {
    service(SecurityContextService).updateSecurityConfig(undefined as unknown as SecurityConfig);
    TestUtil.restoreAllMocks();
  });

  test('should update authenticated user data with new app settings', async () => {
    // Given the context securityService does not have an authenticated user
    expect(ServiceProvider.get(SecurityContextService).getAuthenticatedUser()).toBeUndefined();
    const mockAuthenticatedUser = {
      username: 'testuser',
      password: '',
      external: false,
      authorities: [],
      appSettings: {
        COOKIE_CONSENT: {
          policyAccepted: true,
          statistic: true,
          thirdParty: false,
          updatedAt: 1738753714185
        }
      }
    } as AuthenticatedUserResponse;

    // Given, I have a mocked authenticated user
    TestUtil.mockResponses([
      new ResponseMock('rest/security/authenticated-user').setResponse(mockAuthenticatedUser),
      new ResponseMock(`rest/security/users/${mockAuthenticatedUser.username}`).setResponse({}),
      new ResponseMock('rest/login').setResponse(mockAuthenticatedUser).setHeaders(new Headers({authorization: 'GDB someToken'}))
    ]);

    const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true});
    service(AuthStrategyResolver).resolveStrategy(securityConfig);
    await service(AuthenticationService).login(mockAuthenticatedUser.username, 'password');

    // And I create a mock authenticated user with updated app settings
    const updatedUser = new AuthenticatedUser({
      username: 'testuser',
      appSettings: new AppSettings({
        COOKIE_CONSENT: new CookieConsent({
          policyAccepted: true,
          statistic: true,
          thirdParty: false,
          updatedAt: 1738753714185
        })
      })
    });

    // When the securityService is called to update the user data
    await securityService.updateAuthenticatedUser(updatedUser.toUser());

    // Then the updated user should be in the context
    expect(ServiceProvider.get(SecurityContextService).getAuthenticatedUser()).toMatchObject(updatedUser);
  });

  describe('getSecurityConfig', () => {
    it('should fetch and map securityConfig', async () => {
      TestUtil.mockResponses([
        new ResponseMock('rest/security/all').setResponse(ProviderResponseMocks.securityConfig)
      ]);

      const mappedConfig = new SecurityConfigMapper().mapToModel(
        ProviderResponseMocks.securityConfig as SecurityConfigResponse
      );

      const result = await securityService.getSecurityConfig();
      expect(result).toEqual(mappedConfig);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should fetch and map authenticated user', async () => {
      const getAuthenticatedUserSpy = jest.spyOn(service(SecurityRestService), 'getAuthenticatedUser');
      const mockAuthenticatedUser = {
        username: 'testuser',
        password: '',
        external: false,
        authorities: [],
        appSettings: {
          COOKIE_CONSENT: {
            policyAccepted: true,
            statistic: true,
            thirdParty: false,
            updatedAt: 1738753714185
          }
        }
      } as AuthenticatedUserResponse;

      // Given, I have a mocked authenticated user
      TestUtil.mockResponses([
        new ResponseMock('rest/security/authenticated-user').setResponse(mockAuthenticatedUser)
      ]);

      const mappedUser = new AuthenticatedUserMapper().mapToModel(mockAuthenticatedUser);

      const result = await securityService.getAuthenticatedUser();
      expect(getAuthenticatedUserSpy).toHaveBeenCalled();
      expect(result).toEqual(mappedUser);
    });
  });

  describe('getAdminUser', () => {
    it('should fetch and map admin user', async () => {
      TestUtil.mockResponse(new ResponseMock('rest/security/users/admin').setResponse(ProviderResponseMocks.adminUserResponse));
      const getAdminUserSpy = jest.spyOn(service(UsersService), 'getAdminUser');
      const mappedAdminUser = new UserResponseMapper().mapToModel(ProviderResponseMocks.adminUserResponse);

      const result = await securityService.getAuthenticatedAdminUser();
      expect(getAdminUserSpy).toHaveBeenCalled();
      expect(result).toEqual(AuthenticatedUser.fromUser(mappedAdminUser));
    });
  });

  describe('isPasswordLoginEnabled / isOpenIDEnabled', () => {
    it('should return flags from contextService.getSecurityConfig()', () => {
      const securityConfig = SecurityConfigTestUtil.createSecurityConfig(ProviderResponseMocks.securityConfig);
      service(SecurityContextService).updateSecurityConfig(securityConfig);

      expect(securityService.isPasswordLoginEnabled()).toBe(true);
      expect(securityService.isOpenIDEnabled()).toBe(false);
    });

    it('should return undefined if no config', () => {
      expect(service(SecurityContextService).getSecurityConfig()).toBeUndefined();
      expect(securityService.isPasswordLoginEnabled()).toBeFalsy();
      expect(securityService.isOpenIDEnabled()).toBeFalsy();
    });
  });

  describe('loginGdbToken', () => {
    it('should call loginGdbToken of rest service', async () => {
      const mockAuthenticatedUser = {
        username: 'testuser',
        password: '',
        external: false,
        authorities: [],
        appSettings: {
          COOKIE_CONSENT: {
            policyAccepted: true,
            statistic: true,
            thirdParty: false,
            updatedAt: 1738753714185
          }
        }
      } as AuthenticatedUserResponse;

      TestUtil.mockResponses([
        new ResponseMock('rest/login').setResponse(mockAuthenticatedUser).setHeaders(new Headers({authorization: 'token123'}))
      ]);

      const securityConfig = SecurityConfigTestUtil.createSecurityConfig({enabled: true});
      service(AuthStrategyResolver).resolveStrategy(securityConfig);

      const loginGdbTokenResponse = jest.spyOn(service(SecurityRestService), 'loginGdbToken');

      await securityService.loginGdbToken('u', 'p');
      expect(loginGdbTokenResponse).toHaveBeenCalledWith('u', 'p');
    });
  });

  describe('getFreeAccess', () => {
    it('should fetch and map free access settings', async () => {
      // Given, I have raw free access data from the backend
      const rawFreeAccess = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: {
          DEFAULT_VIS_GRAPH_SCHEMA: false,
          DEFAULT_INFERENCE: false,
          DEFAULT_SAMEAS: true,
          IGNORE_SHARED_QUERIES: false,
          EXECUTE_COUNT: true,
          COOKIE_CONSENT: true
        }
      };
      const mappedFreeAccess = new AuthSettingsMapper().mapToModel(rawFreeAccess);

      TestUtil.mockResponses([
        new ResponseMock('rest/security/free-access').setResponse(rawFreeAccess)
      ]);

      const freeAccessRestSpy = jest.spyOn(service(SecurityRestService), 'getFreeAccess');

      // When, I call getFreeAccess
      const result = await securityService.getFreeAccess();

      // Then, I expect the rest securityService to be called and response to be mapped
      expect(freeAccessRestSpy).toHaveBeenCalled();
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
        appSettings: new AppSettings({
          DEFAULT_VIS_GRAPH_SCHEMA: false,
          DEFAULT_INFERENCE: false,
          DEFAULT_SAMEAS: true,
          IGNORE_SHARED_QUERIES: false,
          EXECUTE_COUNT: true,
          COOKIE_CONSENT: true
        })
      });

      const expectedRequestData = {
        enabled: true,
        authorities: ['ROLE_USER'],
        appSettings: {
          DEFAULT_VIS_GRAPH_SCHEMA: false,
          DEFAULT_INFERENCE: false,
          DEFAULT_SAMEAS: true,
          IGNORE_SHARED_QUERIES: false,
          EXECUTE_COUNT: true,
          COOKIE_CONSENT: true
        }
      };

      TestUtil.mockResponses([
        new ResponseMock('rest/security/free-access').setResponse({}),
        new ResponseMock('rest/security/all').setResponse({...ProviderResponseMocks.securityConfig, freeAccess: expectedRequestData})
      ]);

      const setFreeAccessRestSpy = jest.spyOn(service(SecurityRestService), 'setFreeAccess');
      const updateSecurityConfigSpy = jest.spyOn(service(SecurityContextService), 'updateSecurityConfig');

      // When, I call setFreeAccess with enabled true and settings
      await securityService.setFreeAccess(enabled, freeAccess);

      // Then, I expect the rest securityService to be called with correct data
      expect(setFreeAccessRestSpy).toHaveBeenCalledWith(expectedRequestData);
      expect(updateSecurityConfigSpy).toHaveBeenCalled();
    });

    it('should set free access without authorities when disabled', async () => {
      TestUtil.mockResponses([
        new ResponseMock('rest/security/free-access').setResponse({}),
        new ResponseMock('rest/security/all').setResponse({...ProviderResponseMocks.securityConfig, freeAccess: {enabled: false}})
      ]);

      // Given, I want to disable free access
      const enabled = false;
      const setFreeAccessRestSpy = jest.spyOn(service(SecurityRestService), 'setFreeAccess');
      const updateSecurityConfigSpy = jest.spyOn(service(SecurityContextService), 'updateSecurityConfig');

      // When, I call setFreeAccess with enabled false
      await securityService.setFreeAccess(enabled);

      // Then, I expect the rest securityService to be called with only enabled flag
      expect(setFreeAccessRestSpy).toHaveBeenCalledWith({
        enabled: false
      });
      expect(updateSecurityConfigSpy).toHaveBeenCalled();
    });

    it('should not be able to enable free access without optional settings', async () => {
      // Given, I want to enable free access but provide no additional settings
      const enabled = true;

      // I expect an error when, I call setFreeAccess with enabled true but no freeAccess object
      expect(() => securityService.setFreeAccess(enabled)).toThrow('Free access settings must be provided when enabling free access');
    });
  });
});
