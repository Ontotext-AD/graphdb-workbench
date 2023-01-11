import {merge} from "lodash";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$repositories', 'toastr', '$translate', 'SparqlRestService'];

function SparqlEditorCtrl($scope, $repositories, toastr, $translate, SparqlRestService) {

    this.repository = '';

    $scope.config = undefined;

    function init() {
        $scope.configChanged();
    }

    $scope.configChanged = function () {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                endpoint: `/repositories/${activeRepository}`,
                showToolbar: true
            };
        }
    };

    $scope.queryExecuted = function (query) {
        console.log(query.detail);
    };

    $scope.createSavedQuery = function (event) {
        const payload = {
            name: event.detail.queryName,
            body: event.detail.query,
            shared: event.detail.isPublic
        };
        SparqlRestService.addNewSavedQuery(payload).then((res) => {
            toastr.success($translate.instant('query.editor.save.saved.query.success.msg', {name: payload.name}));
            $scope.config = merge({}, $scope.config, {
                savedQuery: {
                    saveSuccess: true
                }
            });
        }).catch((err) => {
            const msg = getError(err);
            const errorMessage = $translate.instant('query.editor.create.saved.query.error');
            toastr.error(msg, errorMessage);
            $scope.config = merge({}, $scope.config, {
                savedQuery: {
                    saveSuccess: false,
                    errorMessage: [errorMessage]
                }
            });
        });
    };

    $scope.$on('repositoryIsSet', $scope.configChanged);

    init();
}
