import 'angular/core/services/cookie.service';

// The name of the cookie that stores installation-related data.
const INSTALLATION_COOKIE_NAME = '_wb';

// The version of the installation cookie format. This is used to ensure
// compatibility with future versions of the cookie structure.
const INSTALLATION_COOKIE_VERSION = 'WB1';

// The number of days the installation cookie will remain valid before it expires.
// In this case, the cookie is set to expire in 400 days from the date it is created.
const INSTALLATION_COOKIE_EXPIRATION_IN_DAYS = 400;

const modules = [
    'graphdb.framework.core.services.cookieService'
];

angular.module('graphdb.framework.core.services.installationCookieService', modules)
    .service('InstallationCookieService', ['CookieService', InstallationCookieService]);

/**
 * Service to manage installation-specific cookies for the application.
 * It checks if a specific installation cookie exists, sets it if necessary,
 * retrieves it, or deletes it when required.
 *
 * @param {Object} CookieService - AngularJS service to manage cookies.
 * @return {Object} - Returns an object with methods to get, set, setIfAbsent, and remove installation cookies.
 */
function InstallationCookieService(CookieService) {

    /**
     * Checks if the installation cookie exists and retrieves its value.
     *
     * @return {string|undefined} The installation cookie value if it exists, otherwise undefined.
     */
    const get = () => {
        return CookieService.get(INSTALLATION_COOKIE_NAME);
    };

    /**
     * Creates and sets an installation cookie with a specific installation ID and the current timestamp.
     * The cookie value is constructed as `version.installationId.timestamp`, and it is set to expire
     * in 400 days (based on the `INSTALLATION_COOKIE_EXPIRATION_IN_DAYS` constant).
     *
     * @param {string} installationId - The unique installation ID to be stored in the cookie.
     */
    const set = (installationId) => {
        const timestamp = Date.now();
        const cookieValue = `${INSTALLATION_COOKIE_VERSION}.${installationId}.${timestamp}`;
        CookieService.set(INSTALLATION_COOKIE_NAME, cookieValue, {expiration: INSTALLATION_COOKIE_EXPIRATION_IN_DAYS});
    };

    /**
     * Sets the installation cookie if it does not already exist.
     *
     * @param {string} installationId - The unique installation ID to be stored in the cookie.
     */
    const setIfAbsent = (installationId) => {
        if (!get()) {
            set(installationId);
        }
    };

    /**
     * Deletes the installation cookie by removing it from the browser.
     */
    const remove = () => {
        CookieService.remove(INSTALLATION_COOKIE_NAME);
    };

    return {
        get,
        set,
        setIfAbsent,
        remove
    };
}
