define([],
    function () {

        angular
            .module('graphdb.framework.graphexplore.services.savedgraphs', [])
            .factory('SavedGraphsService', SavedGraphsService);

        SavedGraphsService.$inject = ['$http', '$repositories'];

        function SavedGraphsService($http, $repositories) {
            return {
                getSavedGraphs: getSavedGraphs,
                getSavedGraph: getSavedGraph,
                editSavedGraph: editSavedGraph,
                deleteSavedGraph: deleteSavedGraph,
                addNewSavedGraph: addNewSavedGraph
            };

            function getSavedGraphs() {
                return $http.get('rest/explore-graph/saved');
            }

            function getSavedGraph(id) {
                return $http.get('rest/explore-graph/saved/' + encodeURIComponent(id));
            }

            function editSavedGraph(graph) {
                return $http.put('rest/explore-graph/saved/' + encodeURIComponent(graph.id), graph);
            }

            function deleteSavedGraph(graph) {
                return $http.delete('rest/explore-graph/saved/' + encodeURIComponent(graph.id));
            }

            function addNewSavedGraph(graph) {
                return $http.post('rest/explore-graph/saved', graph);
            }
        }
    });
