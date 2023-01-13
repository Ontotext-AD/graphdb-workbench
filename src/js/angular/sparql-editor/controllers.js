import {merge} from "lodash";
import {savedQueriesResponseMapper} from "../rest/mappers/saved-query-response-mapper";

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

    $scope.configChanged = () => {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                endpoint: `/repositories/${activeRepository}`,
                showToolbar: true,
                componentId: 'graphdb-workbench-sparql-editor'
            };
        }
    };

    $scope.queryExecuted = (query) => {
        console.log(query.detail);
    };

    $scope.createSavedQuery = (event) => {
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

    $scope.loadSavedQueries = () => {
        SparqlRestService.getSavedQueries().then((res) => {
            const savedQueries = savedQueriesResponseMapper(res.data);
            $scope.config = merge({}, $scope.config, {
                savedQueries: {
                    data: savedQueries
                }
            });
        }).catch((err) => {
            const msg = getError(err);
            toastr.error(msg, $translate.instant('query.editor.get.saved.queries.error'));
        });
    };

    $scope.$on('repositoryIsSet', $scope.configChanged);
    $scope.$on('language-changed', function (event, args) {
        $scope.language = args.locale;
    });

    init();
}
