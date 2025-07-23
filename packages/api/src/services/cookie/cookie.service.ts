import {Service} from '../../providers/service/service';
import {AuthenticatedUser} from '../../models/security';
import {CookieConsent} from '../../models/cookie';
import {ServiceProvider} from '../../providers';
import {SecurityContextService, SecurityService} from '../security';
import {EventEmitter} from '../../emitters/event.emitter';

export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed-event';

/**
 * Service class for handling cookie-related operations.
 */
export class CookieService implements Service {
  private readonly eventEmitter = new EventEmitter<CookieConsent>();

  /**
   * Accepts the cookie policy for the authenticated user.
   *
   * @returns {Promise<void>} - A promise that resolves when the request to the backend has passed.
   */
  acceptCookiePolicy(): Promise<void> {
    const user = this.setAcceptedCookiePolicy();
    return ServiceProvider.get(SecurityService).updateUserData(user)
      .then(() => {
        this.eventEmitter.emit({NAME: COOKIE_CONSENT_CHANGED_EVENT, payload: user.appSettings.COOKIE_CONSENT as CookieConsent});
      });
  }

  private setAcceptedCookiePolicy(): AuthenticatedUser {
    const user = ServiceProvider.get(SecurityContextService).getAuthenticatedUser() || new AuthenticatedUser({});

    let cookieConsent: CookieConsent;
    if (user.appSettings?.COOKIE_CONSENT) {
      cookieConsent = new CookieConsent(user.appSettings.COOKIE_CONSENT as CookieConsent);
    } else {
      cookieConsent = new CookieConsent({thirdParty: true, statistic: true});
    }

    cookieConsent.policyAccepted = true;
    cookieConsent.updatedAt = Date.now();
    user.appSettings.COOKIE_CONSENT = cookieConsent;
    return user;
  }
}
