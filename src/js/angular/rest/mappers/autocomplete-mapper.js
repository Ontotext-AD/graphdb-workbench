/**
 * Maps the autocomplete suggestions response to internal model by wrapping uris in triangle brackets.
 * @param {Object} response
 * @return {{type: string, value: string, description: string}[]}
 */
export const mapUriAsNtripleAutocompleteResponse = (response) => {
    if (response && response.data && response.data.suggestions) {
        return response.data.suggestions.map((suggestion) => {
            return {
                type: suggestion.type,
                value: suggestion.value,
                description: suggestion.description
            };
        });
    }
    return [];
};
