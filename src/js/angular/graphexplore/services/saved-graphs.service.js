const SAVED_GRAPHS_ENDPOINT = 'rest/explore-graph/saved';

angular
    .module('graphdb.framework.graphexplore.services.savedgraphs', [])
    .factory('SavedGraphsService', SavedGraphsService);

SavedGraphsService.$inject = ['$http', '$repositories'];

function SavedGraphsService($http) {
    return {
        getSavedGraphs: getSavedGraphs,
        getSavedGraph: getSavedGraph,
        editSavedGraph: editSavedGraph,
        deleteSavedGraph: deleteSavedGraph,
        addNewSavedGraph: addNewSavedGraph
    };

    function getSavedGraphs() {
        return $http.get(SAVED_GRAPHS_ENDPOINT);
    }

    function getSavedGraph(id) {
        return $http.get(SAVED_GRAPHS_ENDPOINT + '/' + encodeURIComponent(id));
    }

    function editSavedGraph(graph) {
        return $http.put(SAVED_GRAPHS_ENDPOINT + '/' + encodeURIComponent(graph.id), graph);
    }

    function deleteSavedGraph(graph) {
        return $http.delete(SAVED_GRAPHS_ENDPOINT + '/' + encodeURIComponent(graph.id));
    }

    function addNewSavedGraph(graph) {
        return $http.post(SAVED_GRAPHS_ENDPOINT, graph);
    }
}
