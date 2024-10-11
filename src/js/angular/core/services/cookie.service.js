const COOKIE_NAME = '_wb=';
const COOKIE_VERSION = 'WB1';
const EXPIRATION_DATE = new Date('2099-12-31T23:59:59Z');

angular.module('graphdb.framework.core.services.cookieService', [])
    .service('CookieService', ['$cookies', CookieService]);

/**
 * Service to manage cookies for the application. It checks if a specific cookie exists,
 * sets it if necessary, retrieves it, or deletes it when required.
 *
 * @param {Object} $cookies - AngularJS service to manage cookies.
 * @return {Object} - Returns an object with methods to get, set, and delete cookies.
 */
function CookieService($cookies) {

    /**
     * Checks if the cookie exists and retrieves its value.
     * @return {string|null} The cookie value if it exists, otherwise null.
     */
    const getCookie = () => {
        return $cookies.get(COOKIE_NAME) || null;
    };

    /**
     * Creates and sets a cookie with a specific installation ID and the current timestamp.
     * The cookie is set to expire on December 31, 2099.
     *
     * @param {string} installationId - The unique installation ID to be stored in the cookie.
     */
    const setCookie = (installationId) => {
        const timestamp = Date.now();
        const cookieValue = `${COOKIE_VERSION}.${installationId}.${timestamp}`;
        $cookies.put(COOKIE_NAME, cookieValue, {expires: EXPIRATION_DATE, path: '/'});
    };

    /**
     * Checks if the cookie exists, and if it doesn't, creates a new cookie with the specified
     * installation ID and sets it with the current timestamp.
     *
     * @param {string} installationId - The unique installation ID to be stored in the cookie.
     */
    const setCookieIfAbsent = (installationId) => {
        if (!getCookie()) {
            setCookie(installationId);
        }
    };

    /**
     * Deletes the cookie by removing it.
     */
    const deleteCookie = () => {
        $cookies.remove(COOKIE_NAME, {path: '/'});
    };

    return {
        getCookie,
        setCookie,
        setCookieIfAbsent,
        deleteCookie
    };
}
