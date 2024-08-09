const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

/**
 *  Utilities for URL manipulation, validation, etc.
 */
export class UrlUtils {
    /**
     * Validates whether the given string is a valid URL.
     *
     * @param {string} url - The URL string to validate.
     * @return {boolean} True if the URL is valid, false otherwise.
     */
    static isValidUrl(url) {
        return urlRegex.test(url);
    }
}
