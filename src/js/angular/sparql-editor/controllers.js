import {merge} from "lodash";
import {savedQueriesResponseMapper} from "../rest/mappers/saved-query-response-mapper";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$repositories', 'toastr', '$translate', 'SparqlRestService', '$languageService'];

function SparqlEditorCtrl($scope, $repositories, toastr, $translate, SparqlRestService, $languageService) {

    this.repository = '';

    $scope.config = undefined;
    $scope.savedQueryConfig = undefined;

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
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.addNewSavedQuery(payload).then(() => queryCreatedHandler(payload)).catch(querySaveErrorHandler);
    };

    $scope.updateSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.editSavedQuery(payload).then(() => queryUpdatedHandler(payload)).catch(querySaveErrorHandler);
    };

    $scope.loadSavedQueries = () => {
        SparqlRestService.getSavedQueries().then((res) => {
            const savedQueries = savedQueriesResponseMapper(res.data);
            $scope.savedQueryConfig = {
                savedQueries: savedQueries
            };
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

    // private functions
    const queryPayloadFromEvent = (event) => {
        return {
            name: event.detail.queryName,
            body: event.detail.query,
            shared: event.detail.isPublic
        };
    };

    const querySavedhandler = (successMessage) => {
        toastr.success(successMessage);
        $scope.savedQueryConfig = merge({}, $scope.savedQueryConfig, {
            saveSuccess: true
        });
    };

    const queryCreatedHandler = (payload) => {
        return querySavedhandler($translate.instant('query.editor.save.saved.query.success.msg', {name: payload.name}));
    };

    const queryUpdatedHandler = (payload) => {
        return querySavedhandler($translate.instant('query.editor.edit.saved.query.success.msg', {name: payload.name}));
    };

    const querySaveErrorHandler = (err) => {
        const msg = getError(err);
        const errorMessage = $translate.instant('query.editor.create.saved.query.error');
        toastr.error(msg, errorMessage);
        $scope.savedQueryConfig = merge({}, $scope.savedQueryConfig, {
            saveSuccess: false,
            errorMessage: [errorMessage]
        });
    };
}
