import {merge} from "lodash";
import {
    savedQueriesResponseMapper,
    queryPayloadFromEvent,
    savedQueryResponseMapper, buildQueryModel
} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";
import {QueryMode} from "../utils/query-types";

angular
    .module('graphdb.framework.sparql-editor.controllers', ['ui.bootstrap'])
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = ['$scope', '$location', '$jwtAuth', '$repositories', 'toastr', '$translate', 'SparqlRestService', 'ShareQueryLinkService', '$languageService', 'RDF4JRepositoriesRestService'];

function SparqlEditorCtrl($scope, $location, $jwtAuth, $repositories, toastr, $translate, SparqlRestService, ShareQueryLinkService, $languageService, RDF4JRepositoriesRestService) {
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
    $scope.prefixes = {};

    // =========================
    // Public functions
    // =========================

    $scope.updateConfig = () => {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                endpoint: `/repositories/${activeRepository}`,
                showToolbar: true,
                componentId: 'graphdb-workbench-sparql-editor',
                headers: () => {
                    return headers;
                },
                prefixes: $scope.prefixes
            };
        }
    };

    // =========================
    // Event handlers
    // =========================

    /**
     * When the repository gets changed through the UI, we need to update the yasgui configuration so that new queries
     * to be issued against the new repository.
     */
    $scope.$on('repositoryIsSet', $scope.updateConfig);
    $scope.$on('repositoryIsSet', init);

    $scope.$on('language-changed', function (event, args) {
        $scope.language = args.locale;
    });

    /**
     * Handles the queryExecuted event emitted by the ontotext-yasgui. The event is fired immediately before sending the
     * request and the request object can be altered here and it will be sent with these changes.
     * @param {object} event The event payload containing the query and the request object.
     */
    $scope.queryExecuted = (event) => {
        updateRequestHeaders(event.detail.request);
        changeEndpointByQueryType(event.detail.queryMode, event.detail.request);
    };

    /**
     * Handles the createSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
     * be created.
     * @param {object} event The event payload containing the query data from which a saved query object should be
     * created.
     */
    $scope.createSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.addNewSavedQuery(payload).then(() => queryCreatedHandler(payload)).catch(querySaveErrorHandler);
    };

    $scope.notify = (notification) => {
        if ("success" === notification.detail.type) {
            toastr.success(notification.detail.message);
        } else if ("warning" === notification.detail.type) {
            toastr.warning(notification.detail.message);
        } else if ("error" === notification.detail.type) {
            toastr.error(notification.detail.message);
        }
    };

    /**
     * Handles the updateSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
     * be updated.
     * @param {object} event The event payload containing the saved query data which should be updated.
     */
    $scope.updateSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.editSavedQuery(payload).then(() => queryUpdatedHandler(payload)).catch(querySaveErrorHandler);
    };

    /**
     * Handles the deleteSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
     * be deleted.
     * @param {object} event The event payload containing the saved query data which should be deleted.
     */
    $scope.deleteSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        SparqlRestService.deleteSavedQuery(payload.name).then(() => {
            toastr.success($translate.instant('query.editor.delete.saved.query.success.msg', {savedQueryName: payload.name}));
        }).catch((err) => {
            const msg = getError(err);
            toastr.error(msg, $translate.instant('query.editor.delete.saved.query.error'));
        });
    };

    /**
     * Handles the shareSavedQuery event emitted by the ontotext-yasgui. The event is fired when a saved query should
     * be shared and is expected the share link to be created.
     * @param {object} event The event payload containing the saved query data from which the share link to be created.
     */
    $scope.shareSavedQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        $scope.savedQueryConfig = {
            shareQueryLink: ShareQueryLinkService.createShareSavedQueryLink(payload.name, payload.owner)
        };
    };

    /**
     * Handles the shareQuery event emitted by the ontotext-yasgui. The event is fired when a query should be shared and
     * is expected the share link to be created.
     * @param {object} event The event payload containing the query data from which the share link to be created.
     */
    $scope.shareQuery = (event) => {
        const payload = queryPayloadFromEvent(event);
        $scope.savedQueryConfig = {
            shareQueryLink: ShareQueryLinkService.createShareQueryLink(payload)
        };
    };

    /**
     * Handles the queryShareLinkCopied event emitted by the ontotext-yasgui. The event is fired when a query share link
     * is copied by the user.
     */
    $scope.queryShareLinkCopied = () => {
        toastr.success($translate.instant('modal.ctr.copy.url.success'));
    };

    /**
     * The event is fired when saved queries should be loaded in order to be displayed to the user.
     */
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
    // Private function
    // =========================

    const updateRequestHeaders = (req) => {
        const authToken = $jwtAuth.getAuthToken();
        if (authToken) {
            req.header['Authorization'] = authToken;
        }
        // TODO: implement
        // headers['X-GraphDB-Catch'] = scope.currentTabConfig.pageSize + '; throw';
        // Generates a new tracking alias for queries based on time
        $scope.currentTrackAlias = `query-editor-${performance.now()}-${Date.now()}`;
        req.header['X-GraphDB-Track-Alias'] = $scope.currentTrackAlias;
        req.header['X-GraphDB-Repository-Location'] = $repositories.getActiveRepositoryObject().location;
        req.header['X-Requested-With'] = 'XMLHttpRequest';
    };

    const changeEndpointByQueryType = (queryMode, request) => {
        // if query mode is 'query' -> '/repositories/repo-name'
        // if query mode is 'update' -> '/repositories/repo-name/statements'
        if (queryMode === QueryMode.update) {
            request.url += '/statements';
        }
    };

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

    function setPrefixes(namespacesResponse) {
        const usedPrefixes = {};
        namespacesResponse.data.results.bindings.forEach(function (e) {
            usedPrefixes[e.prefix.value] = e.namespace.value;
        });
        $scope.prefixes = usedPrefixes;
    }

    // Initialization and bootstrap
    function init() {
        RDF4JRepositoriesRestService.getRepositoryNamespaces()
            .then((namespacesResponse) => {
                setPrefixes(namespacesResponse);
            })
            .finally(() => {
                $scope.updateConfig();
                // check is there is a savedquery or query url parameter and init the editor
                initViewFromUrlParams();
                // on repo change do the same as above
                // focus on the active editor on init
            });
    }

    init();
}
