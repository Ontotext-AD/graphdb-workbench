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
    };

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
    };

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
     * @returns {*|Promise<unknown>}
     */
    const deleteEndpoint = (repositoryId, endpointId) => {
        if (DEVELOPMENT) {
            return _mockBackend.deleteEndpointMock(repositoryId, endpointId);
        }
        return $http.delete(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/endpoints/${endpointId}`);
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
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/generate/shapes`, payload);
        //TODO: remove later when integration with the backend is complete
        // return new Promise((resolve, reject) => {
        //    setTimeout(() => {
        //        resolve(generationReport);
        //    }, 3000);
        // });
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
        return $http.post(`${REPOSITORIES_ENDPOINT}/${repositoryId}/manage/graphql/generate`, payload);
        // TODO: remove later when integration with the backend is complete
        // return new Promise((resolve, reject) => {
        //    setTimeout(() => {
        //        resolve(generationReport[0]);
        //    }, 3000);
        // });
    };

    return {
        getEndpoints,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixes,
        getShaclShapeGraphs,
        getGraphqlGenerationSettings,
        getGraphqlEndpointConfigurationSettings,
        saveEndpointConfigurationSettings,
        deleteEndpoint,
        generateEndpointFromGraphqlShapes,
        generateEndpointFromOwl
    };
}

// TODO: remove later when integration with the backend is complete
const generationReport = [
  {
    "id": "1",
    "endpointId": "endpoint_1",
    "endpointURI": "/graphql/endpoint_1",
    "active": true,
    "default": false,
    "label": "Endpoint 1",
    "description": "Description for endpoint 1",
    "lastModified": "2023-10-01",
    "objectsCount": 10,
    "propertiesCount": 5,
    "warnings": 1,
    "errors": 0,
    "messages": ["Warning: Something might be wrong"]
  },
  {
    "id": "2",
    "endpointId": "endpoint_2",
    "endpointURI": "/graphql/endpoint_2",
    "active": false,
    "default": true,
    "label": "Endpoint 2",
    "description": "Description for endpoint 2",
    "lastModified": "2023-10-02",
    "objectsCount": 0,
    "propertiesCount": 0,
    "warnings": 0,
    "errors": 1,
    "messages": ["Error: Something is wrong"]
  },
  {
    "id": "3",
    "endpointId": "endpoint_3",
    "endpointURI": "/graphql/endpoint_3",
    "active": true,
    "default": false,
    "label": "Endpoint 3",
    "description": "Description for endpoint 3",
    "lastModified": "2023-10-03",
    "objectsCount": 0,
    "propertiesCount": 0,
    "warnings": 2,
    "errors": 1,
    "messages": ["Warning: Something might be wrong", "Error: Something is wrong"]
  }
]
