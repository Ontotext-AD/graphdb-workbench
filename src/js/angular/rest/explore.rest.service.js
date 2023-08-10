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

    /**
     * Fetches graph of a resource.
     *
     * @param {ResourceInfo} resourceInfo - holds information about the resource.
     * @param {string} accept - specifies the content type of response.
     * @return {ResourceGraphResponse}
     */
    const getGraph = (resourceInfo, accept) => {
        return $http.get(`${EXPLORE_ENDPOINT}/graph`, {
            params: {
                uri: resourceInfo.uri,
                triple: resourceInfo.triple,
                inference: resourceInfo.contextType.id,
                role: resourceInfo.role,
                bnodes: resourceInfo.blanks,
                sameAs: resourceInfo.sameAs,
                context: resourceInfo.context
            },
            headers: {
                'Accept': accept || 'application/x-graphdb-table-results+json'
            }
        })
            .then((response) => response.data);
    };


    return {
        getResourceDetails,
        getGraph
    };
}
