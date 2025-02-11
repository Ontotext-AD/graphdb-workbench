/**
* Maps an object based on a set of mapping rules.
*
* @param {Object} source - The original object.
* @param {Object} rules - An object where each key corresponds to a property in `source`
*                         that needs transformation. The value is a function that takes the
*                         original value and returns the transformed value.
* @returns {Object} - A new object with all properties copied, but with those specified in `rules` transformed.
*/
export const mapObject = (source, rules = {}) => {
    return Object.keys(source).reduce((result, key) => {
        if (typeof rules[key] === 'function') {
            result[key] = rules[key](source[key]);
        } else {
            result[key] = source[key];
        }
        return result;
    }, {});
}
