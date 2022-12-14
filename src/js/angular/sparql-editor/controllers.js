angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope'];

function SparqlEditorCtrl($scope) {
    $scope.config = {
        yasguiConfig: {
            requestConfig: {
                endpoint: "/repositories/test-repo"
            }
        }
    };

    $scope.queryExecuted = function (query) {
        console.log(query.detail);
    };
}
