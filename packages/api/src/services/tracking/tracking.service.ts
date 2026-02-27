import {Service} from '../../providers/service/service';
import {AuthenticatedUser} from '../../models/security';
import {CookieConsent} from '../../models/tracking';
import {service} from '../../providers';
import {AuthenticationService, AuthorizationService, SecurityContextService, SecurityService} from '../security';
import {EventEmitter} from '../../emitters/event.emitter';
import {TrackingStorageService} from './tracking-storage.service';
import {LicenseContextService, LicenseService} from '../license';
import {WindowService} from '../window';
import {InstallationCookieService} from './installation-cookie.service';
import {GoogleAnalyticsCookieService} from './google-analytics-cookie.service';

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
  private readonly licenseService = service(LicenseService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly installationCookieService = service(InstallationCookieService);
  private readonly googleAnalyticsCookieService = service(GoogleAnalyticsCookieService);

  private readonly eventEmitter = new EventEmitter<CookieConsent>();

  /**
   * Determines whether tracking is allowed based on the current license and development mode.
   *
   * @return Returns `true` if tracking is allowed, otherwise returns `false`.
   */
  isTrackingAllowed(): boolean {
    return this.licenseService.isTrackableLicense() && !WindowService.getWindow().wbDevMode;
  }

  /**
   * Accepts the cookie policy for the authenticated user.
   * Consent is persisted either on server or in local storage depending on the user's authentication status and free
   * access settings.
   * If the user is authenticated or security is OFF, the consent is stored in the backend.
   * If the user is not authenticated and security is ON, regardless the free access status, the consent is stored in
   * local storage.
   *
   * @returns A promise that resolves when the request to the backend has passed.
   */
  acceptCookiePolicy(): Promise<void> {
    const authenticatedUser = this.securityContextService.getAuthenticatedUser();
    if (authenticatedUser) {
      this.updateUserCookieConsent(authenticatedUser);
      this.securityContextService.updateAuthenticatedUser(authenticatedUser);
      const isLoggedIn = this.securityContextService.getIsLoggedIn();
      const securityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled();
      const persistConsentInLocalStorage = securityEnabled && !isLoggedIn;
      if (persistConsentInLocalStorage) {
        // Don't update the user but store data in local storage because the user is not authenticated and the server will
        // throw an error if we try to update the user without authentication.
        const consent = authenticatedUser.getCookieConsent();
        if (consent) {
          this.trackingStorageService.setCookieConsent(consent);
        }
        return Promise.resolve().finally(() => this.applyTrackingConsent());
      }
      return this.securityService.updateAuthenticatedUser(authenticatedUser.toUser())
        .then(() => {
          this.eventEmitter.emit({
            NAME: COOKIE_CONSENT_CHANGED_EVENT,
            payload: authenticatedUser.appSettings.COOKIE_CONSENT as CookieConsent
          });
        })
        .finally(() => this.applyTrackingConsent());
    }
    return Promise.reject(new Error('No authenticated user found'));
  }

  /**
   * Retrieves the current cookie consent preferences for the user
   *  - If principal has no username => read local storage.
   *  - If none in local storage => return defaults.
   *  - If principal has a username => read from principal.appSettings.
   * @return The current cookie consent preferences for the user.
   */
  getCookieConsent(): CookieConsent {
    const principal = this.securityContextService.getAuthenticatedUser();

    // No username => use local storage
    if (!principal?.username) {
      if (this.authorizationService.hasFreeAccess()) {
        const localConsent = this.trackingStorageService.getCookieConsent();
        if (localConsent) {
          return localConsent;
        }
        return CookieConsent.NOT_ACCEPTED_WITH_TRACKING();
      }
      return CookieConsent.ACCEPTED_NO_TRACKING();
    }

    if (!principal.appSettings?.COOKIE_CONSENT) {
      return CookieConsent.NOT_ACCEPTED_WITH_TRACKING();
    }

    return CookieConsent.fromJSON(principal.appSettings.COOKIE_CONSENT);
  }

  /**
   * Checks if tracking is allowed and, if so, fetches the current user consent,
   * then sets or removes tracking cookies accordingly.
   * @returns A promise that resolves when the tracking consent has been applied.
   */
  applyTrackingConsent(){
    if (!this.isTrackingAllowed()) {
      this.cleanUpTracking();
      return Promise.resolve();
    } else {
      const cookieConsent = this.getCookieConsent();
      if (cookieConsent.hasChanged() && !cookieConsent.policyAccepted) {
        this.cleanUpTracking();
        return;
      }

      if (cookieConsent.statistic) {
        const installationId = this.licenseContextService.getLicenseSnapshot()?.installationId || '';
        this.installationCookieService.setIfAbsent(installationId);
      } else {
        this.installationCookieService.remove();
      }

      if (cookieConsent.thirdParty) {
        this.googleAnalyticsCookieService.setIfAbsent();
      } else {
        this.googleAnalyticsCookieService.remove();
      }
    }
  }

  /**
   * Removes all tracking-related cookies and scripts.
   * This function is called when tracking is not allowed by the license
   * or when the user has opted out of all tracking options.
   */
  cleanUpTracking () {
    this.installationCookieService.remove();
    this.googleAnalyticsCookieService.remove();
  };

  private updateUserCookieConsent(user: AuthenticatedUser): void {
    let cookieConsent: CookieConsent;
    if (user.appSettings?.COOKIE_CONSENT) {
      cookieConsent = new CookieConsent(user.appSettings.COOKIE_CONSENT);
    } else {
      cookieConsent = new CookieConsent({thirdParty: true, statistic: true});
    }

    cookieConsent.policyAccepted = true;
    cookieConsent.updatedAt = Date.now();
    user.appSettings.COOKIE_CONSENT = cookieConsent;
  }
}
