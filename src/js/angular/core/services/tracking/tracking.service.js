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
    .service('TrackingService', ['$window', '$jwtAuth', '$translate', '$licenseService', 'toastr', 'InstallationCookieService', 'GoogleAnalyticsCookieService', TrackingService]);

/**
 * Service for managing user tracking based on their cookie consent preferences.
 * Handles the initialization, updating, and cleanup of tracking cookies and scripts.
 *
 * @param {Object} $window - Angular wrapper for the browser's window object, used for environment checks.
 * @param {Object} $jwtAuth - Service for user authentication and data retrieval.
 * @param {Object} $translate - Service for translating messages.
 * @param {Object} $licenseService - Service for checking license type and status.
 * @param {Object} toastr - Service for displaying toast notifications.
 * @param {Object} InstallationCookieService - Service for managing installation cookies.
 * @param {Object} GoogleAnalyticsCookieService - Service for managing Google Analytics cookies.
 * @constructor
 */
function TrackingService($window, $jwtAuth, $translate, $licenseService, toastr, InstallationCookieService, GoogleAnalyticsCookieService) {
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
     * Initializes tracking based on user consent settings and license status.
     * If tracking is allowed, checks the user’s consent preferences and enables
     * or disables tracking scripts and cookies accordingly.
     * @function init
     */
    const init = () => {
        if (!isTrackingAllowed()) {
            cleanUpTracking();
        } else {
            $jwtAuth.getPrincipal()
                .then((principal) => {
                    const cookieConsent = CookieConsent.fromJSON(principal.appSettings.COOKIE_CONSENT);
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
                })
                .catch((error) => {
                    const msg = getError(error.data, error.status);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        }
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

    /**
     * Retrieves the current cookie consent preferences for the logged-in user.
     * If no consent data exists, defaults are returned.
     *
     * @function getCookieConsent
     * @return {Promise<CookieConsent>} A promise resolving to the user's cookie consent preferences.
     */
    const getCookieConsent = () => {
        return $jwtAuth.getPrincipal()
            .then((principal) => {
                if (!principal || !principal.appSettings || !principal.appSettings.COOKIE_CONSENT) {
                    return new CookieConsent(undefined, true, true);
                }
                return CookieConsent.fromJSON(principal.appSettings.COOKIE_CONSENT);
            });
    };

    /**
     * Updates the user's cookie consent preferences.
     * Saves the updated preferences and reinit tracking based on new consent settings.
     *
     * @function updateCookieConsent
     * @param {CookieConsent} consent - An instance of CookieConsent with updated preferences.
     */
    const updateCookieConsent = (consent) => {
        return $jwtAuth.getPrincipal()
            .then((data) => {
                const appSettings = data.appSettings;
                const username = data.username;
                appSettings.COOKIE_CONSENT = consent.toJSON();
                return $jwtAuth.updateUserData({appSettings, username});
            })
            .finally(() => init());
    };

    return {
        init,
        getCookieConsent,
        updateCookieConsent,
        isTrackingAllowed
    };
}
