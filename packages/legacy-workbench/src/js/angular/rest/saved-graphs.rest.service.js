angular
    .module('graphdb.framework.rest.graphexplore.savedgraphs.service', [])
    .factory('SavedGraphsRestService', SavedGraphsRestService);

SavedGraphsRestService.$inject = ['$http'];

const SAVED_GRAPHS_ENDPOINT = 'rest/explore-graph/saved';

function SavedGraphsRestService($http) {
    return {
        getSavedGraphs,
        getSavedGraph,
        editSavedGraph,
        deleteSavedGraph,
        addNewSavedGraph
    };

    function getSavedGraphs() {
        return $http.get(SAVED_GRAPHS_ENDPOINT);
    }

    function getSavedGraph(id) {
        return $http.get(`${SAVED_GRAPHS_ENDPOINT}/${encodeURIComponent(id)}`);
    }

    function editSavedGraph(graph) {
        return $http.put(`${SAVED_GRAPHS_ENDPOINT}/${encodeURIComponent(graph.id)}`, graph);
    }

    function deleteSavedGraph(graph) {
        return $http.delete(`${SAVED_GRAPHS_ENDPOINT}/${encodeURIComponent(graph.id)}`);
    }

    function addNewSavedGraph(graph) {
        return $http.post(SAVED_GRAPHS_ENDPOINT, graph);
    }
}
