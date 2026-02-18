import {Service} from '../../providers/service/service';
import {AuthenticatedUser} from '../../models/security';
import {CookieConsent} from '../../models/cookie';
import {service} from '../../providers';
import {AuthenticationService, AuthorizationService, SecurityContextService, SecurityService} from '../security';
import {EventEmitter} from '../../emitters/event.emitter';

export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed-event';

/**
 * Service for managing user tracking based on their cookie consent preferences.
 */
export class TrackingService implements Service {
  private readonly securityService = service(SecurityService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly authorizationService = service(AuthorizationService);
  private readonly eventEmitter = new EventEmitter<CookieConsent>();

  /**
   * Accepts the cookie policy for the authenticated user.
   *
   * @returns {Promise<void>} - A promise that resolves when the request to the backend has passed.
   */
  acceptCookiePolicy(): Promise<void> {
    const authenticatedUser = this.setAcceptedCookiePolicy();
    const hasFreeAccess = this.authenticationService.isAuthenticated() || this.authorizationService.hasFreeAccess();
    if (hasFreeAccess) {
      // TODO: don't update the user but store data in local storage as it was in the legacy tracking service
    }
    return this.securityService.updateAuthenticatedUser(authenticatedUser.toUser())
      .then(() => {
        this.eventEmitter.emit({NAME: COOKIE_CONSENT_CHANGED_EVENT, payload: authenticatedUser.appSettings.COOKIE_CONSENT as CookieConsent});
      });
  }

  private setAcceptedCookiePolicy(): AuthenticatedUser {
    const user = this.securityContextService.getAuthenticatedUser() || new AuthenticatedUser({});

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
