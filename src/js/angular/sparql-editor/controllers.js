import {merge} from "lodash";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$repositories', 'toastr', '$translate', 'SparqlRestService', '$languageService'];

function SparqlEditorCtrl($scope, $repositories, toastr, $translate, SparqlRestService, $languageService) {

    this.repository = '';

    $scope.config = undefined;

    $scope.language = $languageService.getLanguage();

    function init() {
        $scope.configChanged();
    }

    $scope.configChanged = function () {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                endpoint: `/repositories/${activeRepository}`,
                showToolbar: true,
                componentId: 'graphdb-workbench-sparql-editor'
            };
        }
    };

    $scope.$on('repositoryIsSet', $scope.configChanged);
    $scope.$on('language-changed', function (event, args) {
        $scope.language = args.locale;
    });

    init();
}
