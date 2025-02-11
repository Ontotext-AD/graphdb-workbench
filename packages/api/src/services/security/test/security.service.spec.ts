import {SecurityService} from '../security.service';
import {AuthenticatedUser} from '../../../models/security';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {ServiceProvider} from '../../../providers';
import {SecurityContextService} from '../security-context.service';

describe('SecurityService', () => {
  let securityService: SecurityService;

  beforeEach(() => {
    securityService = new SecurityService();
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

    TestUtil.mockResponse(new ResponseMock('/rest/security/users/testuser').setResponse({}));

    // When the service is called to update the user data
    await securityService.updateUserData(updatedUser);

    // Then the updated user should be in the context
    expect(ServiceProvider.get(SecurityContextService).getAuthenticatedUser()).toEqual(updatedUser);
  });
});
