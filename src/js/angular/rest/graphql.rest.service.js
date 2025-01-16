import {REPOSITORIES_ENDPOINT} from './repositories.rest.service';

angular
    .module('graphdb.framework.rest.graphql.service', [])
    .factory('GraphqlRestService', GraphqlRestService);

GraphqlRestService.$inject = ['$http'];

function GraphqlRestService($http) {

    const getEndpoints = (repositoryId) => {
        return $http.get(`${REPOSITORIES_ENDPOINT}/${repositoryId}/graphql/endpoints`);
    };

    return {
        getEndpoints
    };
}
