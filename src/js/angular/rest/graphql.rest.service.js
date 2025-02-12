import {REPOSITORIES_ENDPOINT} from './repositories.rest.service';
import {GraphqlRestServiceMock} from "./mock-backend/graphql-rest-service-mock";

angular
    .module('graphdb.framework.rest.graphql.service', [])
    .factory('GraphqlRestService', GraphqlRestService);

GraphqlRestService.$inject = ['$http'];

// const DEVELOPMENT = true;
const DEVELOPMENT = false;

function GraphqlRestService($http) {

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
     * @return {*|Promise<unknown>}
     */
    const getEndpointsInfo = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getEndpointsInfoMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/endpoints`);
    };

    /**
     * Get the GraphQL schema shapes for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*|Promise}
     */
    const getGraphqlSchemaShapes = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getGraphqlSchemaShapesMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/shapes`);
    }

    /**
     * Get the prefixes for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*}
     */
    const getPrefixes = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getPrefixesMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/prefixes`);
    }

    /**
     * Get the SHACL shape graphs for the given repository.
     * @param {string} repositoryId The repository ID.
     * @returns {*} The SHACL shape graphs response.
     */
    const getShaclShapeGraphs = (repositoryId) => {
        if (DEVELOPMENT) {
            return _mockBackend.getShaclGraphsMock(repositoryId);
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/shacl_graphs`);
    }

    /**
     * Get the GraphQL generation settings from the backend.
     * @returns {*|Promise<unknown>}
     */
    const getGraphqlGenerationSettings = () => {
        if (DEVELOPMENT) {
            return _mockBackend.getGraphqlGenerationSettingsMock();
        }
        return $http.get(`${REPOSITORIES_ENDPOINT}/manage/graphql/generate/config`);
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
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/${endpointId}/config`);
    };

    /**
     * Save the GraphQL endpoint configuration settings.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @param {*} endpointSettings The endpoint settings.
     * @returns {*|Promise<unknown>}
     */
    const saveEndpointConfigurationSettings = (repositoryId, endpointId, endpointSettings) => {
        if (DEVELOPMENT) {
            return _mockBackend.saveEndpointConfigurationMock();
        }
        return $http.put(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/${endpointId}/config`, endpointSettings);
    };

    /**
     * Delete the GraphQL endpoint.
     * @param {string} repositoryId The repository ID.
     * @param {string} endpointId The endpoint ID.
     * @returns {*}
     */
    const deleteEndpoint = (repositoryId, endpointId) => {
        if (DEVELOPMENT) {
            return _mockBackend.deleteEndpointMock(repositoryId, endpointId);
        }
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/endpoints/${endpointId}`);
    }

    return {
        getEndpoints,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixes,
        getShaclShapeGraphs,
        getGraphqlGenerationSettings,
        getGraphqlEndpointConfigurationSettings,
        saveEndpointConfigurationSettings,
        deleteEndpoint
    };
}
