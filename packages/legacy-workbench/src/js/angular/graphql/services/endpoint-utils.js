import {endpointUrl} from "../models/endpoints";
import {REPOSITORIES_ENDPOINT} from "../../rest/repositories.rest.service";

/**
 * Utility function to resolve the GraphQL endpoint URL based on the active repository and the actual graphql endpoint IDs.
 * @param {string} repositoryId The active repository ID.
 * @param {string} graphqlEndpointId The GraphQL endpoint ID.
 * @returns {`rest/repositories/${string}/graphql/${string}`}
 */
export const resolveGraphqlEndpoint = (repositoryId, graphqlEndpointId) => {
    return `${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/${graphqlEndpointId}`;
}

/**
 * Resolves the playground URL with the given endpoint ID as a query parameter.
 * @param {string} endpointId - The endpoint ID.
 * @returns {`/graphql/playground?endpointId=${string}`}
 */
export const resolvePlaygroundUrlWithEndpoint = (endpointId) => {
    return `${endpointUrl.PLAYGROUND}?endpointId=${endpointId}`;
}
