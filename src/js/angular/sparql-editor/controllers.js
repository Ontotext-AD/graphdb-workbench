import {merge} from "lodash";
import {savedQueriesResponseMapper, savedQueryPayloadFromEvent} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$location', '$repositories', 'toastr', '$translate', 'SparqlRestService', 'ShareQueryLinkService', '$languageService'];

function SparqlEditorCtrl($scope, $location, $repositories, toastr, $translate, SparqlRestService, ShareQueryLinkService, $languageService) {

    this.repository = '';

    $scope.config = undefined;
    $scope.savedQueryConfig = undefined;

    $scope.language = $languageService.getLanguage();

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
        const payload = savedQueryPayloadFromEvent(event);
        SparqlRestService.addNewSavedQuery(payload).then(() => queryCreatedHandler(payload)).catch(querySaveErrorHandler);
    };

    $scope.updateSavedQuery = (event) => {
        const payload = savedQueryPayloadFromEvent(event);
        SparqlRestService.editSavedQuery(payload).then(() => queryUpdatedHandler(payload)).catch(querySaveErrorHandler);
    };

    $scope.deleteSavedQuery = (event) => {
        const payload = savedQueryPayloadFromEvent(event);
        SparqlRestService.deleteSavedQuery(payload.name).then(() => {
            toastr.success($translate.instant('query.editor.delete.saved.query.success.msg', {savedQueryName: payload.name}));
        }).catch((err) => {
            const msg = getError(err);
            toastr.error(msg, $translate.instant('query.editor.delete.saved.query.error'));
        });
    };

    $scope.shareSavedQuery = (event) => {
        const payload = savedQueryPayloadFromEvent(event);
        $scope.savedQueryConfig = {
            shareQueryLink: ShareQueryLinkService.createShareSavedQueryLink(payload.name, payload.owner)
        };
    };

    $scope.savedQueryShareLinkCopied = () => {
        toastr.success($translate.instant('modal.ctr.copy.url.success'));
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

    // private functions

    const initTabFromSavedQuery = (queryParams) => {
        const savedQueryName = queryParams[RouteConstants.savedQueryName];
        const savedQueryOwner = queryParams[RouteConstants.savedQueryOwner];
        SparqlRestService.getSavedQuery(savedQueryName, savedQueryOwner).then((res) => {
            // TODO:
            // * Check if there is an open tab with the same query already. If there is one, then open it.
            // * Otherwise open a new tab and load the query in the editor.
            // * Before opening a new tab: check if there is a running query or update and prevent it. Same should be
            // checked on tab switching for existing tab too.
        }).catch((err) => {
            toastr.error($translate.instant('query.editor.missing.saved.query.data.error', {
                savedQueryName: savedQueryName,
                error: getError(err)
            }));
        });
    };

    const initFromUrlParams = () => {
        const queryParams = $location.search();
        if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared saved query link
            initTabFromSavedQuery(queryParams);
        } else if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared query link
        }
    };

    const querySavedHandler = (successMessage) => {
        toastr.success(successMessage);
        $scope.savedQueryConfig = merge({}, $scope.savedQueryConfig, {
            saveSuccess: true
        });
    };

    const queryCreatedHandler = (payload) => {
        return querySavedHandler($translate.instant('query.editor.save.saved.query.success.msg', {name: payload.name}));
    };

    const queryUpdatedHandler = (payload) => {
        return querySavedHandler($translate.instant('query.editor.edit.saved.query.success.msg', {name: payload.name}));
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

    // Initialization and bootstrap
    function init() {
        $scope.configChanged();
        // check is there is a savedquery or query url parameter and init the editor
        initFromUrlParams();
        // on repo change do the same as above
        // focus on the active editor on init
    }

    init();
}
