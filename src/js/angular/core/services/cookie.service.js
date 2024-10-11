const COOKIE_NAME = '_wb=';
const COOKIE_VERSION = 'WB1';
const PATH = "; path=/";
const EXPIRATION = "; expires=Fri, 31 Dec 2099 23:59:59 GMT";
const EXPIRED = "; Max-Age=-99999999";
const COOKIE_SEPARATOR = ';';

angular.module('graphdb.framework.core.services.cookieService', [])
    .service('CookieService', ['$document', CookieService]);

/**
 * Service to manage cookies for the application. It checks if a specific cookie exists,
 * sets it if necessary, retrieves it, or deletes it when required.
 *
 * @param {Object} $document - AngularJS service to interact with the document object.
 * @return {Object} - Returns an object with methods to get, set, and delete cookies.
 */
function CookieService($document) {

    /**
     * Checks if the cookie exists and retrieves its value.
     * @return {string|null} The cookie value if it exists, otherwise null.
     */
    const getCookie = () => {
        const cookieName = COOKIE_NAME;
        const cookies = $document[0].cookie.split(COOKIE_SEPARATOR);
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(cookieName) === 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
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
        $document[0].cookie = COOKIE_NAME + cookieValue + EXPIRATION + PATH;
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
     * Deletes the cookie by setting an expired date, effectively removing it from the browser.
     */
    const deleteCookie = () => {
        $document[0].cookie = COOKIE_NAME + EXPIRED + PATH;
    };

    return {
        getCookie,
        setCookie,
        setCookieIfAbsent,
        deleteCookie
    };
}
