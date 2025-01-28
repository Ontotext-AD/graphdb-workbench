import {GraphqlEndpointInfo, GraphqlEndpointsInfoList} from "../../models/graphql/graphql-endpoints-info";

/**
 * Maps the response from the server to a GraphqlEndpointsInfoList model.
 * @param {object} data - The response from the server.
 * @return {GraphqlEndpointsInfoList}
 */
export const endpointsInfoListMapper = (data) => {
    if (!data || !data.endpoints) {
        return new GraphqlEndpointsInfoList();
    }
    const endpointModels = data.endpoints.map((endpoint) => endpointInfoModelMapper(endpoint));
    return new GraphqlEndpointsInfoList(endpointModels);
};

/**
 * Maps the response from the server to a GraphqlEndpointInfo model.
 * @param {object} data - The response from the server.
 * @return {GraphqlEndpointInfo}
 */
export const endpointInfoModelMapper = (data) => {
    if (!data) {
        return;
    }
    return new GraphqlEndpointInfo({
        id: data.id,
        endpointId: data.endpointId,
        endpointURI: data.endpointURI,
        label: data.label,
        description: data.description,
        default: data.default,
        active: data.active,
        lastModified: data.lastModified,
        objectsCount: data.objects_count,
        propertiesCount: data.properties_count,
        warnings: data.warnings,
        errors: data.errors,
        status: data.status
    });
};
