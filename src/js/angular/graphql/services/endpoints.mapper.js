import {GraphqlEndpoint, GraphqlEndpointList} from "../../models/graphql/graphql-endpoints";
import {SelectMenuOptionsModel} from "../../models/form-fields";

/**
 * Maps the response from the server to a GraphqlEndpointList model.
 * @param {object} data - The response from the server.
 * @return {GraphqlEndpointList}
 */
export const endpointListMapper = (data) => {
    if (!data || !data.endpoints) {
        return new GraphqlEndpointList();
    }
    const endpointModels = data.endpoints.map((endpoint) => endpointModelMapper(endpoint));
    return new GraphqlEndpointList(endpointModels);
};

/**
 * Maps the response from the server to a GraphqlEndpoint model.
 * @param {object} data - The response from the server.
 * @return {GraphqlEndpoint}
 */
export const endpointModelMapper = (data) => {
    if (!data) {
        return;
    }
    return new GraphqlEndpoint({
        id: data.id,
        graphql: data.graphQL,
        active: data.active,
        default: data.default
    });
};

/**
 * Maps the response from the server to a SelectMenuOptionsModel array.
 * @param {object} data - The response from the server.
 * @return {SelectMenuOptionsModel[]}
 */
export const endpointsToSelectMenuOptionsMapper = (data) => {
    if (!data || !data.endpoints.length) {
        return [];
    }
    return data.endpoints.map((endpoint) => {
        return new SelectMenuOptionsModel({
            value: endpoint.graphQL,
            label: endpoint.id,
            selected: endpoint.default,
            data: {
                active: endpoint.active
            }
        });
    });
};
