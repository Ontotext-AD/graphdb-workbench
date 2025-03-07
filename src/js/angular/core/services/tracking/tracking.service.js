import 'angular/core/services/tracking/cookie.service';
import 'angular/core/services/tracking/installation-cookie.service';
import 'angular/core/services/tracking/google-analytics-cookie.service';
import 'angular/core/directives/cookie-policy/cookie-consent.directive';
import {CookieConsent} from "../../../models/cookie-policy/cookie-consent";

const modules = [
    'graphdb.framework.core.services.cookieService',
    'graphdb.framework.core.services.installationCookieService',
    'graphdb.framework.core.services.googleAnalyticsCookieService',
    'graphdb.framework.core.directives.cookie-consent'

];
angular.module('graphdb.framework.core.services.trackingService', modules)
    .factory('TrackingService', ['$window', '$jwtAuth', '$licenseService', 'InstallationCookieService', 'GoogleAnalyticsCookieService', 'LocalStorageAdapter', 'LSKeys',
        TrackingService]);

/**
 * Service for managing user tracking based on their cookie consent preferences.
 * Handles the initialization, updating, and cleanup of tracking cookies and scripts.
 *
 * @param {Object} $window - Angular wrapper for the browser's window object, used for environment checks.
 * @param {Object} $jwtAuth - Service for user authentication and data retrieval.
 * @param {Object} $licenseService - Service for checking license type and status.
 * @param {Object} InstallationCookieService - Service for managing installation cookies.
 * @param {Object} GoogleAnalyticsCookieService - Service for managing Google Analytics cookies.
 * @param {Object} LocalStorageAdapter - Service for interfacing with local storage.
 * @param {Object} LSKeys - Constants for local storage keys.
 * @constructor
 */
function TrackingService($window, $jwtAuth, $licenseService, InstallationCookieService, GoogleAnalyticsCookieService, LocalStorageAdapter, LSKeys) {
    /**
     * Determines if tracking is allowed based on license and product type.
     * @return {boolean} A boolean indicating if tracking is allowed.
     */
    const isTrackingAllowed = () => {
        const isFreeLicense = $licenseService.isFreeLicense();
        const isProduction = !$window.wbDevMode;
        return isFreeLicense && isProduction;
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
                    if (!cookieConsent.getPolicyAccepted()) {
                        cleanUpTracking();
                        return;
                    }

                    if (cookieConsent.getStatisticConsent()) {
                        const installationId = $licenseService.license().installationId || '';
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
                const localConsent = LocalStorageAdapter.get(LSKeys.COOKIE_CONSENT);

                // No username => use local storage
                if (principal && !principal.username) {
                    if (localConsent) {
                        return CookieConsent.fromJSON(localConsent);
                    }
                    return new CookieConsent(undefined, true, true);
                }

                if (!principal.appSettings || !principal.appSettings.COOKIE_CONSENT) {
                    return new CookieConsent(undefined, true, true);
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
                    const appSettings = data.appSettings;
                    appSettings.COOKIE_CONSENT = consent.toJSON();
                    return $jwtAuth.updateUserData({ appSettings, username });
                }
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
