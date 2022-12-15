angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$repositories'];

function SparqlEditorCtrl($scope, $repositories) {

    this.repository = "";

    $scope.config = undefined;

    function init() {
        $scope.configChanged();
    }

    $scope.queryExecuted = function (query) {
        console.log(query.detail);
    };

    $scope.configChanged = function () {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                yasguiConfig: {
                    requestConfig: {
                        endpoint: `/repositories/${activeRepository}`
                    }
                }
            };
        }
    };

    $scope.$on('repositoryIsSet', $scope.configChanged);

    init();
}
