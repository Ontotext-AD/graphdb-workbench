/**
 * A mapping of human-readable size units to their corresponding byte values.
 * @constant {Object}
 */
const HUMAN_READABLE_SIZE_UNITS = {
    BYTES: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5
};

/**
 * A regular expression to match human-readable size strings.
 * Example matches: "123 bytes", "1.5 KB", "1 GB", etc.
 * @constant {RegExp}
 */
const IS_HUMAN_READABLE_SIZE_REGEX = /^(\d+(?:\.\d+)?)\s*(bytes|KB|MB|GB|TB|PB)$/i;

/**
 * A regular expression to match strings containing only digits.
 * Example matches: "123", "4567", etc.
 * @constant {RegExp}
 */
const IS_DIGIT_ONLY_REGEX = /^\d+$/;

/**
 * Converts the given <code>size</code> to bytes as a number.
 *
 * The <code>size</code> parameter can be passed in the following forms:
 * <ul>
 *   <li>As a number, e.g., 123, 432, etc.</li>
 *   <li>As a string representing a number, e.g., "123", "432", etc.</li>
 *   <li>As a human-readable string with units, e.g., "123 bytes", "432 KB", etc.</li>
 * </ul>
 *
 * @param {number|string|undefined|null} size - The size to convert.
 * @return {number} The size in bytes. Returns 0 if the input is invalid.
 */
export const convertToBytes = (size) => {

    if (size === undefined || size === null) {
        return 0;
    }

    if (typeof size === 'number') {
        // If size is a number, return it as-is.
        return size;
    }

    size = size.trim();

    if (IS_DIGIT_ONLY_REGEX.test(size)) {
        // If the string contains only digits, parse and return it as an integer.
        return parseInt(size, 10);
    }

    const match = size.match(IS_HUMAN_READABLE_SIZE_REGEX);
    if (!match) {
        return 0;
    }

    // If the size is in human-readable format, calculate the equivalent bytes.
    const value = parseFloat(match[1]);
    const unit = match[2];

    return value * HUMAN_READABLE_SIZE_UNITS[unit.toUpperCase()];
};

/**
 * Converts the given <code>size</code> in bytes to a human-readable string.
 *
 * If the size is already a human-readable string, it will be returned as-is.
 *
 * @param {number|string} size - The size in bytes to convert. Can be a number or a string.
 * @return {string} A human-readable size string, e.g., "1.50 KB", "100 MB". Returns "0 bytes" if the input is invalid or less than or equal to 0.
 */
export const convertToHumanReadable = (size) => {

    if (!angular.isDefined(size)) {
        return '0 bytes';
    }

    if (IS_HUMAN_READABLE_SIZE_REGEX.test(size)) {
        return size;
    }

    if (typeof size === 'string') {
        size = parseFloat(size);
    }

    if (isNaN(size) || size <= 0) {
        return '0 bytes';
    }

    const units = Object.keys(HUMAN_READABLE_SIZE_UNITS).reverse();

    for (const unit of units) {
        const unitValue = HUMAN_READABLE_SIZE_UNITS[unit];
        if (size >= unitValue) {
            const readableSize = size / unitValue;
            // If readableSize is an integer, don't include decimal places.
            const formattedSize = Number.isInteger(readableSize) ? readableSize : readableSize.toFixed(2);
            return `${formattedSize} ${unit.toLowerCase()}`;
        }
    }

    return '0 bytes';
};
