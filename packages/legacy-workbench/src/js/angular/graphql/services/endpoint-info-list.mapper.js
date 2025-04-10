import {GraphqlEndpointInfo, GraphqlEndpointsInfoList} from "../../models/graphql/graphql-endpoints-info";
import {resolveGraphqlEndpoint} from "./endpoint-utils";

/**
 * Maps the response from the server to a GraphqlEndpointsInfoList model.
 * @param {object} data - The response from the server.
 * @param {string} repositoryId - The repository id.
 * @return {GraphqlEndpointsInfoList}
 */
export const endpointsInfoListMapper = (data, repositoryId) => {
    if (!data || !data.endpoints) {
        return new GraphqlEndpointsInfoList();
    }
    const endpointModels = data.endpoints.map((endpoint) => endpointInfoModelMapper(endpoint, repositoryId));
    return new GraphqlEndpointsInfoList(endpointModels);
};

/**
 * Maps the response from the server to a GraphqlEndpointInfo model.
 * @param {*} data - The response from the server.
 * @param {string} repositoryId - The repository id.
 * @return {GraphqlEndpointInfo|undefined}
 */
export const endpointInfoModelMapper = (data, repositoryId) => {
    if (!data) {
        return;
    }
    return new GraphqlEndpointInfo({
        endpointId: data.id,
        endpointURI: resolveGraphqlEndpoint(repositoryId, data.id),
        label: data.label,
        description: data.description,
        default: data.default,
        active: data.active,
        lastModified: data.lastModified,
        objectsCount: data.objectsCount,
        propertiesCount: data.propertiesCount,
        warnings: data.warnings,
        errors: data.errors
    });
};
