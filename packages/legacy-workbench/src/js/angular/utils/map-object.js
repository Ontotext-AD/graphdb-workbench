/**
 * Maps an object based on a set of mapping rules, allowing you to:
 *  - transform a key's value,
 *  - optionally rename the key,
 *  - and choose whether to keep or delete the original key.
 *
 * @param {Object} source - The original object.
 * @param {Object} rules - An object mapping "keyInSource" => transformSpec
 *    transformSpec can be:
 *      (A) a function(value) => transformedValue
 *      (B) an object with:
 *         {
 *           transform: (value) => transformedValue,
 *           newKey: 'someNewKey'
 *         }
 * @param {Object} options
 * @param {boolean} [options.removeOldKey=false] - If true, remove the original key after assigning to newKey.
 *
 * @returns {Object}
 */
export const mapObject = (source, rules = {}, { removeOldKey = false } = {}) => {
    return Object.keys(source).reduce((result, key) => {
        const rule = rules[key];

        if (!rule) {
            // No rule for this key, copy as-is
            result[key] = source[key];
            return result;
        }

        // Rule is simply a transform function => keep same key, transform value
        if (typeof rule === 'function') {
            result[key] = rule(source[key]);
            return result;
        }

        // Otherwise, rule must be an object with { transform, newKey? }
        if (typeof rule.transform === 'function') {
            const transformedValue = rule.transform(source[key]);
            const newKey = rule.newKey || key;

            // Assign the transformed value to the new key
            result[newKey] = transformedValue;

            // If removeOldKey is true, remove the original key from the result
            if (removeOldKey && newKey !== key) {
                // We only delete if it's an actual rename (newKey != key)
                // If newKey === key, it's effectively just a transform in place
                delete result[key];
            } else {
                // If removeOldKey is false, we want to preserve the old key's original value
                // so we explicitly set it here if needed.
                // But since we haven't overwritten it, by default it's still in `result[key]`?
                // Actually, because we started with an empty object (reduce initial {}), we didn't copy it yet,
                // so let's explicitly set the old key if we want to preserve the original:
                if (newKey !== key) {
                    // preserve the original value under the old key
                    result[key] = source[key];
                }
            }
        }

        return result;
    }, {});
};
