import {GraphListOptions, GraphOption} from "../../models/graphs/graph-list-options";

/**
 * Maps the response data to a GraphList object.
 * @param {*} data The response data.
 * @returns {GraphListOptions} The mapped response data to a GraphList model.
 */
export const graphListOptionsMapper = (data) => {
    if (!data.results) {
        return new GraphListOptions();
    }
    const bindingVar = data.head.vars[0];
    return new GraphListOptions(data.results.bindings.map((binding) => {
        return new GraphOption({
            uri: binding[bindingVar].value,
            label: binding[bindingVar].value,
            id: binding[bindingVar].value
        });
    }));
}
