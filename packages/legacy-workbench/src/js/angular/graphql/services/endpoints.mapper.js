import {GraphqlEndpoint, GraphqlEndpointList} from "../../models/graphql/graphql-endpoints";
import {SelectMenuOptionsModel} from "../../models/form-fields";
import {resolveGraphqlEndpoint} from "./endpoint-utils";

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
        endpointId: data.endpointId,
        endpointURI: data.endpointURI,
        active: data.active,
        default: data.default
    });
};

/**
 * Maps the response from the server to a SelectMenuOptionsModel array.
 * @param {object} data - The response from the server.
 * @param {string} repositoryId - The repository id.
 * @return {SelectMenuOptionsModel[]}
 */
export const endpointsToSelectMenuOptionsMapper = (data, repositoryId) => {
    if (!data || !data.length) {
        return [];
    }
    return data.map((endpoint) => {
        return new SelectMenuOptionsModel({
            value: resolveGraphqlEndpoint(repositoryId, endpoint.id),
            label: endpoint.id,
            selected: endpoint.default,
            data: {
                active: endpoint.active,
                default: endpoint.default
            }
        });
    });
};
