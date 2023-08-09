/**
 *  Removes brackets and serial commas from IRIs
 *  when used to create ids for links and markers,
 *  because elements with ids that contain such
 *  are not valid XHTML and cause a host problems
 *  when trying to style individual elements
 * @param {string} string The string to be processed.
 * @return {string} A string where the special characters are removed.
 */
const removeSpecialChars = (string) => {
    return string.replace(/[()']/g, "");
};


const toBoolean = (value) => {
    if (typeof value === 'string') {
        return value === 'true';
    }
    return Boolean(value);
};

export {
    removeSpecialChars,
    toBoolean
};

