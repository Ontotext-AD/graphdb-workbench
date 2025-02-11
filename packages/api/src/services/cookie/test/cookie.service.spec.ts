import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {AuthenticatedUser} from '../../../models/security';
import {CookieService} from '../cookie.service';
import {ServiceProvider} from '../../../providers';
import {SecurityContextService} from '../../security';
import {CookieConsent} from '../../../models/cookie';

describe('CookiesService', () => {
  let cookiesService: CookieService;

  beforeEach(() => {
    cookiesService = new CookieService();
  });

  test('should accept the cookie policy', async () => {
    // Given, I have a mocked authenticated user
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
    ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(mockAuthenticatedUser);
    TestUtil.mockResponse(new ResponseMock(`/rest/security/users/${mockAuthenticatedUser.username}`).setResponse({}));

    // When I call the acceptCookiePolicy method
    await cookiesService.acceptCookiePolicy();

    // Then, the user's cookie consent should be updated
    const updatedUser = ServiceProvider.get(SecurityContextService).getAuthenticatedUser();
    expect(new CookieConsent(updatedUser?.appSettings?.COOKIE_CONSENT as CookieConsent)?.policyAccepted).toEqual(true);
  });
});
