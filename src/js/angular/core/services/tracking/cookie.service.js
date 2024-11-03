angular.module('graphdb.framework.core.services.cookieService', [])
    .service('CookieService', ['$document', '$cookies', CookieService]);

/**
 * Service to manage cookies for the application. It sets it, retrieves it, or deletes it when required.
 *
 * @param {Object} $document - AngularJS service to manage document.
 * @param {Object} $cookies - AngularJS service to manage cookies.
 * @return {Object} - Returns an object with methods to get, set, and remove cookies.
 */
function CookieService($document, $cookies) {
    /**
     * Retrieves the value of a cookie by its key.
     *
     * @param {string} key - The name of the cookie to retrieve.
     * @return {string|undefined} - The value of the cookie, or `undefined` if the cookie doesn't exist.
     */
    const get = (key) => {
        return $cookies[key];
    };

    /**
     * Sets a cookie with the given key, value, and options.
     *
     * @param {string} key - The name of the cookie to set.
     * @param {string} value - The value of the cookie to set.
     * @param {Object} [options={}] - Optional parameters for cookie settings.
     * @param {number} [options.expiration] - Number of days until the cookie expires.  Max supported by browsers
     * is 400 days (or less depending on the browser). If omitted this is a session cookie.
     * @param {string} [options.path='/'] - The URL path that must exist for the cookie to be sent.
     * @param {string} [options.domain] - The domain the cookie is accessible from.
     * @param {boolean} [options.secure] - If `true`, the cookie will only be sent over HTTPS.
     * @param {boolean} [options.httpOnly] - If `true`, the cookie cannot be accessed via JavaScript.
     * @param {string} [options.sameSite] - SameSite cookie attribute ('Strict', 'Lax', 'None').
     */
    const set = (key, value, options = {}) => {
        $document[0].cookie = new CookieBuilder(key, value, options).build();
    };

    /**
     * Deletes a cookie by setting an expired date, effectively removing it from the browser.
     *
     * @param {string} key - The name of the cookie to delete.
     */
    const remove = (key) => {
        $document[0].cookie = new CookieBuilder(key, '', {expiration: -1}).build();
    };

    /**
     * Retrieves all cookies.
     *
     * @return {Object} - An object containing all cookies as key-value pairs.
     */
    const getAll = () => {
        const result = {};
        for (const [key, value] of Object.entries($cookies)) {
            result[key] = value;
        }
        return result;
    };

    return {
        get,
        set,
        remove,
        getAll
    };
}

/**
 * CookieBuilder class for constructing cookies with optional attributes (expiration, path, domain, etc.).
 */
class CookieBuilder {
    /**
     * Constructs a CookieBuilder instance with the given key, value, and options.
     *
     * @param {string} key - The name of the cookie to set.
     * @param {string} value - The value of the cookie to set.
     * @param {Object} [options={}] - Optional parameters for cookie settings (expiration, path, domain, etc.).
     */
    constructor(key, value, options = {}) {
        this.key = encodeURIComponent(key);
        this.value = encodeURIComponent(value);
        this.setOptions(options);
    }

    /**
     * Sets the options for the cookie.
     *
     * @param {Object} options - Object containing optional cookie settings.
     * @param {number} [options.expiration] - Number of days until the cookie expires. If omitted this is a session cookie.
     * @param {string} [options.path='/'] - The URL path for the cookie.
     * @param {string} [options.domain] - The domain where the cookie is accessible.
     * @param {boolean} [options.secure] - Whether the cookie is secure (HTTPS only).
     * @param {boolean} [options.httpOnly] - Whether the cookie is inaccessible via JavaScript.
     * @param {string} [options.sameSite] - SameSite attribute of the cookie ('Strict', 'Lax', 'None').
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setOptions(options) {
        const {expiration, path, domain, secure, httpOnly, sameSite} = options;

        if (expiration) {
            this.setExpiration(expiration);
        }

        this.setPath(path);

        if (domain) {
            this.setDomain(domain);
        }

        if (secure) {
            this.setSecure();
        }

        if (httpOnly) {
            this.setHttpOnly();
        }

        if (sameSite) {
            this.setSameSite(sameSite);
        }

        return this;
    }

    /**
     * Sets the expiration date for the cookie in days.
     *
     * @param {number} expiration - Number of days until the cookie expires.
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setExpiration(expiration) {
        const date = new Date();
        date.setTime(date.getTime() + (expiration * 24 * 60 * 60 * 1000));
        this.expires = date.toUTCString();
        return this;
    }

    /**
     * Sets the path where the cookie is available.
     *
     * @param {string} path - The URL path for the cookie.
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setPath(path) {
        this.path = path || '/';
        return this;
    }

    /**
     * Sets the domain where the cookie is available.
     *
     * @param {string} domain - The domain for the cookie.
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setDomain(domain) {
        this.domain = domain;
        return this;
    }

    /**
     * Marks the cookie as secure (sent over HTTPS only).
     *
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setSecure() {
        this.secure = true;
        return this;
    }

    /**
     * Marks the cookie as HttpOnly (inaccessible via JavaScript).
     *
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setHttpOnly() {
        this.httpOnly = true;
        return this;
    }

    /**
     * Sets the SameSite attribute for the cookie.
     *
     * @param {string} sameSite - SameSite attribute ('Strict', 'Lax', 'None').
     * @return {CookieBuilder} - Returns the current instance for method chaining.
     */
    setSameSite(sameSite) {
        this.sameSite = sameSite;
        return this;
    }

    /**
     * Builds the final cookie string with all set attributes.
     *
     * @return {string} - The complete cookie string.
     */
    build() {
        let cookieStr = `${this.key}=${this.value}`;

        if (this.expires) {
            cookieStr += `; expires=${this.expires}`;
        }

        cookieStr += `; path=${this.path}`;

        if (this.domain) {
            cookieStr += `; domain=${this.domain}`;
        }

        if (this.secure) {
            cookieStr += `; secure`;
        }

        if (this.httpOnly) {
            cookieStr += `; HttpOnly`;
        }

        if (this.sameSite) {
            cookieStr += `; SameSite=${this.sameSite}`;
        }

        return cookieStr;
    }
}
