import 'angular/core/services/tracking/cookie.service';
import 'angular/core/services/tracking/installation-cookie.service';
import 'angular/core/services/tracking/google-analytics-cookie.service';
import 'angular/core/directives/cookie-policy/cookie-consent.directive';
import {CookieConsent} from "../../../models/cookie-policy/cookie-consent";
import {
    SecurityService,
    AuthorizationService,
    service,
    CookieConsent as CookieConsentAPI,
    AuthenticationService,
    SecurityContextService,
    LicenseService,
    LicenseContextService,
} from '@ontotext/workbench-api';

const modules = [
    'graphdb.framework.core.services.cookieService',
    'graphdb.framework.core.services.installationCookieService',
    'graphdb.framework.core.services.googleAnalyticsCookieService',
    'graphdb.framework.core.directives.cookie-consent',
];

angular.module('graphdb.framework.core.services.trackingService', modules)
    .factory('TrackingService', ['$window', '$jwtAuth', 'InstallationCookieService', 'GoogleAnalyticsCookieService', 'LocalStorageAdapter', 'LSKeys',
        TrackingService]);

/**
 * Service for managing user tracking based on their cookie consent preferences.
 * Handles the initialization, updating, and cleanup of tracking cookies and scripts.
 *
 * @param {Object} $window - Angular wrapper for the browser's window object, used for environment checks.
 * @param {Object} $jwtAuth - Service for user authentication and data retrieval.
 * @param {Object} InstallationCookieService - Service for managing installation cookies.
 * @param {Object} GoogleAnalyticsCookieService - Service for managing Google Analytics cookies.
 * @param {Object} LocalStorageAdapter - Service for interfacing with local storage.
 * @param {Object} LSKeys - Constants for local storage keys.
 * @constructor
 */
function TrackingService($window, $jwtAuth, InstallationCookieService, GoogleAnalyticsCookieService, LocalStorageAdapter, LSKeys) {
    // =========================
    // Private variables
    // =========================
    const securityService = service(SecurityService);
    const authorizationService = service(AuthorizationService);
    const licenseService = service(LicenseService);
    const licenseContextService = service(LicenseContextService);

    /**
     * Determines if tracking is allowed based on license and product type.
     * @return {boolean} A boolean indicating if tracking is allowed.
     */
    const isTrackingAllowed = () => {
        const isTrackableLicense = licenseService.isTrackableLicense();
        const isProduction = !$window.wbDevMode;
        return isTrackableLicense && isProduction;
    };

    /**
     * Checks if tracking is allowed and, if so, fetches the current user consent,
     * then sets or removes tracking cookies accordingly.
     */
    const applyTrackingConsent = () => {
        if (!isTrackingAllowed()) {
            cleanUpTracking();
            return Promise.resolve();
        } else {
            return getCookieConsent()
                .then((cookieConsent) => {
                    if (cookieConsent.hasChanged() && !cookieConsent.getPolicyAccepted()) {
                        cleanUpTracking();
                        return;
                    }

                    if (cookieConsent.getStatisticConsent()) {
                        const installationId = licenseContextService.getLicenseSnapshot().installationId || '';
                        InstallationCookieService.setIfAbsent(installationId);
                    } else {
                        InstallationCookieService.remove();
                    }

                    if (cookieConsent.getThirdPartyConsent()) {
                        GoogleAnalyticsCookieService.setIfAbsent();
                    } else {
                        GoogleAnalyticsCookieService.remove();
                    }
                }).catch((error) => {
                    throw error;
                });
        }
    };

    /**
     * Retrieves the current cookie consent preferences for the user
     *  - If principal has no username => read local storage.
     *  - If none in local storage => return defaults.
     *  - If principal has a username => read from principal.appSettings.
     *   @return {Promise<CookieConsent>} A promise resolving to the user's cookie consent preferences.
     */
    const getCookieConsent = () => {
        return $jwtAuth.getPrincipal()
            .then((principal) => {
                // No username => use local storage
                if (!principal || !principal.username) {
                    if (authorizationService.hasFreeAccess()) {
                        const localConsent = LocalStorageAdapter.get(LSKeys.COOKIE_CONSENT);
                        if (localConsent) {
                            return CookieConsent.fromJSON(localConsent);
                        }
                        return CookieConsent.NOT_ACCEPTED_WITH_TRACKING;
                    }
                    return CookieConsent.ACCEPTED_NO_TRACKING;
                }

                if (!principal.appSettings || !principal.appSettings.COOKIE_CONSENT) {
                    return CookieConsent.NOT_ACCEPTED_WITH_TRACKING;
                }

                return CookieConsent.fromJSON(principal.appSettings.COOKIE_CONSENT);
            });
    };

    /**
     * Updates cookie consent (local or server) and then re-init.
     * @param {CookieConsent} consent - An instance of CookieConsent with updated preferences.
     */
    const updateCookieConsent = (consent) => {
        return $jwtAuth.getPrincipal()
            .then((data) => {
                const username = data.username;
                if (!username) {
                    LocalStorageAdapter.set(LSKeys.COOKIE_CONSENT, consent.toJSON());
                } else {
                    const user = data.toUser();
                    const appSettings = user.appSettings;
                    appSettings.COOKIE_CONSENT = new CookieConsentAPI(consent.toJSON());
                    return securityService.updateAuthenticatedUser(user);
                }
            })
            .then(() => {
                // Update the authenticated user in the security context
                authenticationService.getCurrentUser()
                    .then((authenticatedUser) => securityContextService.updateAuthenticatedUser(authenticatedUser));
            })
            .finally(() => applyTrackingConsent());
    };

    /**
     * Removes all tracking-related cookies and scripts.
     * This function is called when tracking is not allowed by the license
     * or when the user has opted out of all tracking options.
     * @function cleanUpTracking
     */
    const cleanUpTracking = () => {
        InstallationCookieService.remove();
        GoogleAnalyticsCookieService.remove();
    };

    return {
        applyTrackingConsent,
        getCookieConsent,
        updateCookieConsent,
        isTrackingAllowed
    };
}
