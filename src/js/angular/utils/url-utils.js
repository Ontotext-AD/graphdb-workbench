const httpRegex = /^(h|ht|htt|http|https|http:|https:|http:\/|https:\/|http:\/\/|https:\/\/|https?:\/\/[\S]*)$/i;
const ftpRegex = /^(f|ft|ftp|ftps|ftp:|ftps:|ftp:\/|ftps:\/|ftp:\/\/|ftps:\/\/[\S]*)$/i;


/**
 *  Utilities for URL manipulation, validation, etc.
 */
export class UrlUtils {
    /**
     * Validates whether the given string is a valid URL or a partial URL that follows the rules.
     *
     * @param {string} url - The URL string to validate.
     * @return {boolean} True if the URL is valid or a valid partial URL, false otherwise.
     */
    static isValidUrl(url) {
        return httpRegex.test(url) || ftpRegex.test(url);
    }

    /**
     * Checks if the URL contains an excluded substring.
     *
     * @param {string} url - The URL string to check.
     * @param {string} exclude - The substring to exclude.
     * @return {boolean} True if the URL does not contain the substring, false if it does.
     */
    static doesNotContain(url, exclude) {
        return !new RegExp(exclude).test(url);
    }

    /**
     * Checks if the URL uses an excluded protocol.
     *
     * @param {string} url - The URL string to check.
     * @param {Array<string>} excludedProtocols - The protocols to exclude.
     * @return {boolean} True if the URL does not use the excluded protocols, false if it does.
     */
    static doesNotUseProtocol(url, excludedProtocols) {
        const protocolPattern = new RegExp('^(' + excludedProtocols.join('|') + ')://', 'i');
        return !protocolPattern.test(url);
    }
}
