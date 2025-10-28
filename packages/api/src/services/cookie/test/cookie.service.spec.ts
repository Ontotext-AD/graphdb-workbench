import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {CookieService} from '../cookie.service';
import {service} from '../../../providers';
import {AuthenticationService} from '../../security';
import {SecurityConfigTestUtil} from '../../utils/test/security-config-test-util';
import {AuthenticatedUserResponse} from '../../../models/security/response-models/authenticated-user-response';

describe('CookiesService', () => {
  let cookiesService: CookieService;
  let mockAuthenticatedUser: AuthenticatedUserResponse;

  beforeEach(async () => {
    cookiesService = new CookieService();
    mockAuthenticatedUser = {
      username: 'testuser',
      password: '',
      external: false,
      authorities: ['ROLE_ADMIN'],
      appSettings: {
        COOKIE_CONSENT: {
          policyAccepted: false,
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
    await service(AuthenticationService).setAuthenticationStrategy(securityConfig);
    await service(AuthenticationService).login(mockAuthenticatedUser.username, 'password');
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  test('should accept the cookie policy', async () => {
    // When I call the acceptCookiePolicy method
    await cookiesService.acceptCookiePolicy();
    const updateUserRequest = TestUtil.getRequest(`rest/security/users/${mockAuthenticatedUser.username}`);
    const requestBody = JSON.parse(updateUserRequest!.body as string);
    expect(requestBody.appSettings.COOKIE_CONSENT.policyAccepted).toEqual(true);
  });
});
