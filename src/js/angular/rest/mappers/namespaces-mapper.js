/**
 * Maps the namespaces response to internal model.
 * @param {Object} response
 * @return {{prefix: string, uri: string}[]}
 */
export const mapNamespacesResponse = (response) => {
    if (response && response.results) {
        return response.results.bindings.map((binding) => {
            return {
                prefix: binding.prefix.value,
                uri: binding.namespace.value
            };
        });
    }
    return [];
};
