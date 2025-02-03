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
        // FIXME: remove when the endpoint is present.
        // return Promise.resolve({
        //     data: {
        //         shacl_graphs: [
        //             // 'http://example.org/graph1',
        //             // 'http://example.org/graph2',
        //             // 'http://example.org/graph3'
        //         ]
        //     }
        // });
    }

    return {
        getEndpoints,
        getEndpointsInfo,
        getGraphqlSchemaShapes,
        getPrefixes,
        getShaclShapeGraphs
    };
}
