export class ObjectUtils {
    /**
     * Checks if the provided object is null or undefined.
     *
     * @param {*} obj - The object to check for null or undefined values.
     * @returns {boolean} True if the object is null or undefined, false otherwise.
     */
    static isNullOrUndefined = (obj) => {
        return obj === null || obj === undefined;
    };
}
