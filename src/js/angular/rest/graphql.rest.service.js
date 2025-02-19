import {REPOSITORIES_ENDPOINT} from './repositories.rest.service';
import {GraphqlRestServiceMock} from "./mock-backend/graphql-rest-service-mock";

angular
    .module('graphdb.framework.rest.graphql.service', [])
    .factory('GraphqlRestService', GraphqlRestService);

GraphqlRestService.$inject = ['$http', 'Upload'];

// const DEVELOPMENT = true;
const DEVELOPMENT = false;

function GraphqlRestService($http, Upload) {

    const _mockBackend = new GraphqlRestServiceMock();

    /**
     * Get the GraphQL endpoints for the given repository.
     * @param {string} repositoryId The repository ID.
     * @return {*|Promise<unknown>}
     */
    const getEndpoints = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getEndpointsMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/endpoints`);
    };

    /**
     * Get the GraphQL endpoints info for the given repository.
     * @param {string} repositoryId The repository ID.
     * @param {string|undefined} lastModified The last modified date.
     * @return {*|Promise<unknown>}
     */
    const getEndpointsInfo = (repositoryId, lastModified) => {
        if (DEVELOPMENT) {
            return _mockBackend.getEndpointsInfoMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/list`);
    };

    /**
     * Get the GraphQL schema shapes for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*|Promise<unknown>}
     */
    const getGraphqlSchemaShapes = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getGraphqlSchemaShapesMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/graphql_shapes`);
    };

    /**
     * Get the prefixes for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*|Promise<unknown>}
     */
    const getPrefixes = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getPrefixesMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/prefixes`);
    }

    /**
     * Get the SHACL shape graphs for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*|Promise<unknown>} The SHACL shape graphs response.
     */
    const getShaclShapeGraphs = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getShaclGraphsMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/shacl_graphs`);
    };

    /**
     * Get the GraphQL generation settings from the backend.
     * @returns {*|Promise<unknown>}
     */
    const getGraphqlGenerationSettings = () => {
        if (DEVELOPMENT) {
            return _mockBackend.getGraphqlGenerationSettingsMock();
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/graphql/manage/generate/config`);
    };

    /**
     * Get the GraphQL endpoint configuration settings from the backend.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {*|Promise<unknown>}
     */
    const getGraphqlEndpointConfigurationSettings = (repositoryId, endpointId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getEndpointConfigurationMock();
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/${endpointId}/config`);
    };

    /**
     * Get the GraphQL endpoint configuration from the backend.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {*|Promise<unknown>}
     */
    const getEndpointConfiguration = (repositoryId, endpointId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getEndpointConfiguration();
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/${endpointId}`);
    };

    /**
     * Edit the GraphQL endpoint configuration.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @param {*} data The request payload.
     * @returns {*|Promise<unknown>}
     */
    const editEndpointConfiguration = (repositoryId, endpointId, data) => {
        if (DEVELOPMENT) {
            return _mockBackend.saveEndpointConfigurationMock();
        }
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/${endpointId}`, data);
    };

    /**
     * Delete the GraphQL endpoint.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {*|Promise<unknown>}
     */
    const deleteEndpoint = (repositoryId, endpointId) => {
        if (DEVELOPMENT) {
            return _mockBackend.deleteEndpointMock(repositoryId, endpointId);
        }
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/${endpointId}`);
    };

    /**
     * Generate the GraphQL endpoint from the GraphQL schema shapes.
     * @param {string} repositoryId The active repository ID.
     * @param {*} payload The request payload for the generation.
     * @returns {*|Promise<unknown>}
     */
    const generateEndpointFromGraphqlShapes = (repositoryId, payload) => {
        if (DEVELOPMENT) {
            return _mockBackend.generateEndpointFromGraphqlShapesMock(payload);
        }
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/generate/graphql_shapes`, payload);
    };

    /**
     * Generate the GraphQL endpoint from the OWL ontologies.
     * @param {string} repositoryId The active repository ID.
     * @param {*} payload The request payload for the generation.
     * @returns {*|Promise<unknown>}
     */
    const generateEndpointFromOwl = (repositoryId, payload) => {
        if (DEVELOPMENT) {
            return _mockBackend.generateEndpointFromOwl(payload);
        }
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/generate/owl_shacl`, payload);
    };

    /**
     * Export the endpoint definition.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {Promise<unknown>} The response from the backend.
     */
    const exportEndpointDefinition = (repositoryId, endpointId) => {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/${endpointId}/export`, {responseType: 'blob'});
    }

    /**
     * Import the endpoint definitions, either as a single file or as multiple files where the file type can be either
     * yaml or zip.
     * @param {string} repositoryId The repository ID.
     * @param {FormData|File} payload The request payload.
     * @param {*} canceler The canceler object.
     * @returns {Promise<unknown>} The response from the backend.
     */
    const importEndpointDefinition = (repositoryId, payload, canceler) => {
        return Upload.http({
            url: `${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/manage/endpoints/import`,
            data: payload,
            headers: {
                'Content-Type': undefined
            },
            timeout: canceler.promise
        });
    };

    return {
        getEndpoints,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixes,
        getShaclShapeGraphs,
        getGraphqlGenerationSettings,
        getGraphqlEndpointConfigurationSettings,
        getEndpointConfiguration,
        editEndpointConfiguration,
        deleteEndpoint,
        generateEndpointFromGraphqlShapes,
        generateEndpointFromOwl,
        exportEndpointDefinition,
        importEndpointDefinition
    };
}
