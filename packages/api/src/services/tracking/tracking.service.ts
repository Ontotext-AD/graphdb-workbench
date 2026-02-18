import {Service} from '../../providers/service/service';
import {AuthenticatedUser} from '../../models/security';
import {CookieConsent} from '../../models/cookie';
import {service} from '../../providers';
import {AuthenticationService, AuthorizationService, SecurityContextService, SecurityService} from '../security';
import {EventEmitter} from '../../emitters/event.emitter';
import {TrackingStorageService} from './tracking-storage.service';

export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed-event';

/**
 * Service for managing user tracking based on their cookie consent preferences.
 */
export class TrackingService implements Service {
  private readonly securityService = service(SecurityService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly authorizationService = service(AuthorizationService);
  private readonly trackingStorageService = service(TrackingStorageService);

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
      return this.getCookieConsent()
        .then((consent) => {
          if (consent) {
            this.trackingStorageService.setCookieConsent(consent);
          }
        })
        .finally(() => {
          // TODO: remove the GTM scripts
        });
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

  /**
   * Retrieves the current cookie consent preferences for the user
   *  - If principal has no username => read local storage.
   *  - If none in local storage => return defaults.
   *  - If principal has a username => read from principal.appSettings.
   *   @return A promise resolving to the user's cookie consent preferences.
   */
  getCookieConsent() {
    const principal = this.securityContextService.getAuthenticatedUser();

    // No username => use local storage
    if (!principal || !principal.username) {
      if (this.authorizationService.hasFreeAccess()) {
        const localConsent = this.trackingStorageService.getCookieConsent();
        if (localConsent) {
          return Promise.resolve(localConsent);
        }
        return Promise.resolve(CookieConsent.NOT_ACCEPTED_WITH_TRACKING());
      }
      return Promise.resolve(CookieConsent.ACCEPTED_NO_TRACKING());
    }

    if (!principal.appSettings || !principal.appSettings.COOKIE_CONSENT) {
      return Promise.resolve(CookieConsent.NOT_ACCEPTED_WITH_TRACKING());
    }

    // @ts-expect-error - COOKIE_CONSENT is typed as boolean | CookieConsent and we should see when it's boolean and handle it
    return Promise.resolve(CookieConsent.fromJSON(principal.appSettings.COOKIE_CONSENT));
  }
}
