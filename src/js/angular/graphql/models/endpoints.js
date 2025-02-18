import {REPOSITORIES_ENDPOINT} from "../../rest/repositories.rest.service";

/**
 * Constants for the view URLs.
 * @type {{[string]: string}}
 */
export const endpointUrl = {
    PLAYGROUND: '/graphql/playground',
    CREATE_ENDPOINT: '/graphql/endpoint/create',
    ENDPOINT_MANAGEMENT: '/graphql/endpoints'
}

/**
 * Utility function to resolve the GraphQL endpoint URL based on the active repository and the actual graphql endpoint IDs.
 * @param {string} repositoryId The active repository ID.
 * @param {string} graphqlEndpointId The GraphQL endpoint ID.
 * @returns {`rest/repositories/${string}/graphql/${string}`}
 */
export const resolveGraphqlEndpoint = (repositoryId, graphqlEndpointId) => {
    return `${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/${graphqlEndpointId}`;
}
