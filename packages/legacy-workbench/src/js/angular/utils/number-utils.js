export class NumberUtils {

    /**
     * Formats a number according to the specified language's locale rules.
     *
     * @param {number} value - The number to format.
     * @param {string} lang - The language code (e.g., "en-US", "fr-FR") defining the locale format.
     * @return {string} The formatted number as a string.
     */
    static formatNumberToLocaleString(value, lang) {
        return value ? value.toLocaleString(lang) : '';
    }
}
