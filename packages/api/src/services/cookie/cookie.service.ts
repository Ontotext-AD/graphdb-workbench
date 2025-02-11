import {Service} from '../../providers/service/service';
import {AuthenticatedUser} from '../../models/security';
import {CookieConsent} from '../../models/cookie';
import {ServiceProvider} from '../../providers';
import {SecurityContextService, SecurityService} from '../security';

/**
 * Service class for handling cookie-related operations.
 */
export class CookieService implements Service {

  /**
   * Accepts the cookie policy for the authenticated user.
   *
   * @returns {Promise<void>} - A promise that resolves when the request to the backend has passed.
   */
  acceptCookiePolicy(): Promise<void> {
    const user = this.setAcceptedCookiePolicy();
    return ServiceProvider.get(SecurityService).updateUserData(user);
  }

  private setAcceptedCookiePolicy(): AuthenticatedUser {
    const user = ServiceProvider.get(SecurityContextService).getAuthenticatedUser() || new AuthenticatedUser({});
    const cookieConsent = new CookieConsent(user.appSettings?.COOKIE_CONSENT as CookieConsent);

    cookieConsent.policyAccepted = true;
    user.appSettings.COOKIE_CONSENT = cookieConsent;
    return user;
  }
}
