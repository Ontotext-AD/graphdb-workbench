import {merge} from "lodash";
import {
    savedQueriesResponseMapper,
    queryPayloadFromEvent,
    savedQueryResponseMapper, buildQueryModel
} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$location', '$jwtAuth', '$repositories', 'toastr', '$translate', 'SparqlRestService', 'ShareQueryLinkService', '$languageService'];

function SparqlEditorCtrl($scope, $location, $jwtAuth, $repositories, toastr, $translate, SparqlRestService, ShareQueryLinkService, $languageService) {

    const ontoElement = document.querySelector('ontotext-yasgui');
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/sparql-results+json',
        'X-GraphDB-Local-Consistency': 'updating'
    };

    this.repository = '';

    $scope.config = undefined;
    $scope.savedQueryConfig = undefined;
    $scope.language = $languageService.getLanguage();

    // =========================
    // Public functions
    // =========================

    $scope.configChanged = () => {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            const authToken = $jwtAuth.getAuthToken();
            if (authToken) {
                headers['Authorization'] = authToken;
            }
            $scope.config = {
                endpoint: `/repositories/${activeRepository}`,
                showToolbar: true,
                componentId: 'graphdb-workbench-sparql-editor',
                headers: () => {
                    return headers;
                }
            };
        }
    };

    $scope.queryExecuted = (query) => {
        // eslint-disable-next-line no-console
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

    $scope.deleteSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.deleteSavedQuery(payload.name).then(() => {
            toastr.success($translate.instant('query.editor.delete.saved.query.success.msg', {savedQueryName: payload.name}));
        }).catch((err) => {
            const msg = getError(err);
            toastr.error(msg, $translate.instant('query.editor.delete.saved.query.error'));
        });
    };

    $scope.shareSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        $scope.savedQueryConfig = {
            shareQueryLink: ShareQueryLinkService.createShareSavedQueryLink(payload.name, payload.owner)
        };
    };

    $scope.shareQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        $scope.savedQueryConfig = {
            shareQueryLink: ShareQueryLinkService.createShareQueryLink(payload)
        };
    };

    $scope.queryShareLinkCopied = () => {
        toastr.success($translate.instant('modal.ctr.copy.url.success'));
    };

    $scope.loadSavedQueries = () => {
        SparqlRestService.getSavedQueries().then((res) => {
            const savedQueries = savedQueriesResponseMapper(res);
            $scope.savedQueryConfig = {
                savedQueries: savedQueries
            };
        }).catch((err) => {
            const msg = getError(err);
            toastr.error(msg, $translate.instant('query.editor.get.saved.queries.error'));
        });
    };

    // =========================
    // Event handlers
    // =========================

    $scope.$on('repositoryIsSet', $scope.configChanged);

    $scope.$on('language-changed', function (event, args) {
        $scope.language = args.locale;
    });

    // =========================
    // Private function
    // =========================

    const initTabFromSavedQuery = (queryParams) => {
        const savedQueryName = queryParams[RouteConstants.savedQueryName];
        const savedQueryOwner = queryParams[RouteConstants.savedQueryOwner];
        SparqlRestService.getSavedQuery(savedQueryName, savedQueryOwner).then((res) => {
            const savedQuery = savedQueryResponseMapper(res);
            // * Check if there is an open tab with the same query already. If there is one, then open it.
            // * Otherwise open a new tab and load the query in the editor.
            // TODO: Before opening a new tab: check if there is a running query or update and prevent opening it.
            // Same as the above should be checked on tab switching for existing tab too.
            ontoElement.openTab(savedQuery);
        }).catch((err) => {
            toastr.error($translate.instant('query.editor.missing.saved.query.data.error', {
                savedQueryName: savedQueryName,
                error: getError(err)
            }));
        });
    };

    const initTabFromSharedQuery = (queryParams) => {
        const queryName = queryParams[RouteConstants.name];
        const query = queryParams[RouteConstants.query];
        const queryOwner = queryParams[RouteConstants.owner];
        const sharedQueryModel = buildQueryModel(query, queryName, queryOwner, true);
        // * Check if there is an open tab with the same query already. If there is one, then open it.
        // * Otherwise open a new tab and load the query in the editor.
        // TODO: Before opening a new tab: check if there is a running query or update and prevent opening it.
        // Same as the above should be checked on tab switching for existing tab too.
        ontoElement.openTab(sharedQueryModel);
    };

    const initViewFromUrlParams = () => {
        const queryParams = $location.search();
        if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared saved query link
            initTabFromSavedQuery(queryParams);
        } else if (queryParams.hasOwnProperty(RouteConstants.query)) {
            // init new tab from shared query link
            initTabFromSharedQuery(queryParams);
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
        initViewFromUrlParams();
        // on repo change do the same as above
        // focus on the active editor on init
    }

    init();
}
