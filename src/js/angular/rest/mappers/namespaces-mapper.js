import {NameSpaceModel} from "../../models/namespaces/namespace";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";

/**
 * Maps the namespaces response to internal model.
 * @param {Object} response
 * @return {{prefix: string, uri: string}[]}
 */
export const mapNamespacesResponse = (response) => {
    if (response && response.data) {
        return response.data.results.bindings.map((binding) => {
            return {
                prefix: binding.prefix.value,
                uri: binding.namespace.value
            };
        });
    }
    return [];
};

/**
 * Maps a binding of repository namespace response to internal model.
 * @param {Object} binding
 * @return {NameSpaceModel}
 */
export const namespaceModelMapper = (binding) => new NameSpaceModel(binding.prefix.value, binding.namespace.value);

/**
 * Maps a bindings of repository namespaces response to NamespacesListModel.
 *
 * @param {*[]} bindings
 * @return {NamespacesListModel}
 */
export const namespaceListModelMapper = (bindings) => {
    const namespaces = bindings ? bindings.map(namespaceModelMapper) : [];
    return new NamespacesListModel(namespaces);
};
