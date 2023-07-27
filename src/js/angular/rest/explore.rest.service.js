angular
    .module('graphdb.framework.rest.explore.rest.service', [])
    .factory('ExploreRestService', ExploreRestService);

ExploreRestService.$inject = ['$http'];

const EXPLORE_ENDPOINT = 'rest/explore';

function ExploreRestService($http) {

    const getResourceDetails = (uri, triple, context, accept) => {
        return $http.get(`${EXPLORE_ENDPOINT}/details`, {
            params: {
                uri,
                triple,
                context
            },
            headers: {
                'Accept': accept || 'application/json'
            }
        });
    };

    return {
        getResourceDetails
    };
}
