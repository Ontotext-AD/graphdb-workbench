import {isFunction, merge} from "lodash";
import {
    savedQueriesResponseMapper,
    queryPayloadFromEvent,
    savedQueryResponseMapper, buildQueryModel
} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";
import {QueryMode} from "../../../models/ontotext-yasgui/query-mode";
import {downloadAsFile, toYasguiOutputModel} from "../utils/yasgui-utils";
import {YasrPluginName} from "../../../models/ontotext-yasgui/yasr-plugin-name";
import {EventDataType} from "../../../models/ontotext-yasgui/event-data-type";
import 'angular/rest/connectors.rest.service';
import 'services/ontotext-yasgui-web-component.service.js';
import 'angular/externalsync/controllers';
import {QueryType} from "../../../models/ontotext-yasgui/query-type";
import {BeforeUpdateQueryResult, BeforeUpdateQueryResultStatus} from "../../../models/ontotext-yasgui/before-update-query-result";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.rest.connectors.service',
    'graphdb.framework.ontotext-yasgui-web-component',
    'graphdb.framework.externalsync.controllers'
];

angular
    .module('graphdb.framework.sparql-editor.controllers', modules)
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = [
    '$scope',
    '$q',
    '$location',
    '$jwtAuth',
    '$repositories',
    'toastr',
    '$translate',
    'SparqlRestService',
    'AutocompleteRestService',
    'ShareQueryLinkService',
    '$languageService',
    'RDF4JRepositoriesRestService',
    'ConnectorsRestService',
    'OntotextYasguiWebComponentService',
    '$uibModal'];

function SparqlEditorCtrl($scope,
                          $q,
                          $location,
                          $jwtAuth,
                          $repositories,
                          toastr,
                          $translate,
                          SparqlRestService,
                          AutocompleteRestService,
                          ShareQueryLinkService,
                          $languageService,
                          RDF4JRepositoriesRestService,
                          ConnectorsRestService,
                          ontotextYasguiWebComponentService,
                          $uibModal) {
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
    const outputHandlers = new Map();
    const downloadAsPluginNameToEventHandler = new Map();
    const tabIdToConnectorProgressModalMapping = new Map();

    // =========================
    // Public functions
    // =========================
    $scope.updateConfig = () => {
        const activeRepository = $repositories.getActiveRepository();
        if (activeRepository) {
            $scope.config = {
                endpoint: getQueryEndpoint(),
                showToolbar: true,
                componentId: 'graphdb-workbench-sparql-editor',
                headers: () => {
                    return headers;
                },
                prefixes: $scope.prefixes,
                pageSize: 1000,
                maxPersistentResponseSize: 500000,
                isVirtualRepository: $repositories.isActiveRepoOntopType(),
                yasqeAutocomplete: {
                    LocalNamesAutocompleter: (term) => {
                        const canceler = $q.defer();
                        return autocompleteLocalNames(term, canceler);
                    }
                },
                getRepositoryStatementsCount: ontotextYasguiWebComponentService.getRepositoryStatementsCount,
                onQueryAborted: ontotextYasguiWebComponentService.onQueryAborted,
                yasrToolbarPlugins: [ontotextYasguiWebComponentService.exploreVisualGraphYasrToolbarElementBuilder],
                beforeUpdateQuery: getBeforeUpdateQueryHandler(),
                i18n: ontotextYasguiWebComponentService.getTranslations()
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
    $scope.$on('repositoryIsSet', init);

    $scope.$on('language-changed', function (event, args) {
        $scope.language = args.locale;
    });

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

    /**
     * Handles the ontotext-yasgui component output events.
     *
     * @param {EventData}$event - the event fired from ontotext-yasgui component
     */
    $scope.output = ($event) => {
        const yasguiOutputModel = toYasguiOutputModel($event);
        if (outputHandlers.has(yasguiOutputModel.TYPE)) {
            outputHandlers.get(yasguiOutputModel.TYPE)(yasguiOutputModel);
        }
    };

    // =========================
    // Private function
    // =========================

    const createParameter = (key, value) => {
        return {key, value};
    };

    const getCommandParameters = (response) => {
        return [createParameter('name', response.data.name)];
    };

    const toNoCommandResponse = () => {
        return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS);
    };

    const toHasNotSupport = (response) => {
        const parameters = [
            createParameter('connectorName', response.data.connectorName),
            createParameter('pluginName', response.data.pluginName)
        ];
        return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.ERROR, 'query.editor.inactive.plugin.warning.msg', parameters);
    };

    const createConnectorProgressDialog = (actionName, iri, connectorName) => {
        const progressScope = $scope.$new(true);

        // This duplicates code in the externalsync module but we can't get it from there
        progressScope.beingBuiltConnector = {
            percentDone: 0,
            status: {
                processedEntities: 0,
                estimatedEntities: 0,
                indexedEntities: 0,
                entitiesPerSecond: 0
            },
            actionName,
            eta: "-",
            inline: false,
            iri,
            name: connectorName,
            doneCallback: function () {
                connectorProgressModal.dismiss('cancel');
            }
        };
        progressScope.getHumanReadableSeconds = $scope.getHumanReadableSeconds;

        const connectorProgressModal = $uibModal.open({
            templateUrl: 'pages/connectorProgress.html',
            controller: 'CreateProgressCtrl',
            size: 'lg',
            backdrop: 'static',
            scope: progressScope
        });
        return connectorProgressModal;
    };

    const toCreateCommandResponse = (response, tabId) => {
        const connectorProgressModal = createConnectorProgressDialog($translate.instant('externalsync.creating'), response.data.iri, response.data.name);
        tabIdToConnectorProgressModalMapping.set(tabId, connectorProgressModal);
        return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, 'created.connector', getCommandParameters(response));
    };

    const toRepairCommandResponse = (response, tabId) => {
        const connectorProgressModal = createConnectorProgressDialog($translate.instant('externalsync.repairing'), response.data.iri, response.data.name);
        tabIdToConnectorProgressModalMapping.set(tabId, connectorProgressModal);
        return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, 'query.editor.repaired.connector', getCommandParameters(response));
    };

    const toDropCommandResponse = (response) => {
        return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, 'externalsync.delete.success.msg', getCommandParameters(response));
    };

    const getBeforeUpdateQueryHandler = () => (query, tabId) => {
        return new Promise(function (resolve) {
            ConnectorsRestService.checkConnector(query)
                .then((response) => {
                    if (!response.data.command) {
                        resolve(toNoCommandResponse());
                        return;
                    }
                    if (!response.data.hasSupport) {
                        resolve(toHasNotSupport(response));
                        return;
                    }
                    switch (response.data.command) {
                        case 'create':
                            resolve(toCreateCommandResponse(response, tabId));
                            break;
                        case 'repair':
                            resolve(toRepairCommandResponse(response, tabId));
                            break;
                        case 'drop':
                            resolve(toDropCommandResponse(response));
                            break;
                    }
                }).catch(() => {
                // for some reason we couldn't check if this is a connector update, so just execute it
                resolve();
            });
        });
    };

    const autocompleteLocalNames = (term, canceler) => {
        return AutocompleteRestService.getAutocompleteSuggestions(term, canceler.promise)
            .then(function (results) {
                canceler = null;
                return results.data;
            });
    };

    const updateRequestHeaders = (req, queryMode, queryType, pageSize) => {
        const authToken = $jwtAuth.getAuthToken();
        if (authToken) {
            req.header['Authorization'] = authToken;
        }
        req.header['X-GraphDB-Catch'] = `${pageSize}; throw`;
        // Generates a new tracking alias for queries based on time
        $scope.currentTrackAlias = `query-editor-${performance.now()}-${Date.now()}`;
        req.header['X-GraphDB-Track-Alias'] = $scope.currentTrackAlias;
        req.header['X-GraphDB-Repository-Location'] = $repositories.getActiveRepositoryObject().location;
        req.header['X-Requested-With'] = 'XMLHttpRequest';

        if (QueryMode.UPDATE === queryMode) {
            req.header['Accept'] = 'text/plain,/;q=0.9';
        } else if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
            req.header['Accept'] = 'application/x-graphdb-table-results+json, application/rdf+json;q=0.9, */*;q=0.8';
        } else {
            req.header['Accept'] = 'application/x-sparqlstar-results+json, application/sparql-results+json;q=0.9, */*;q=0.8';
        }
    };

    const changeEndpointByQueryType = (queryMode, request) => {
        // if query mode is 'query' -> '/repositories/repo-name'
        // if query mode is 'update' -> '/repositories/repo-name/statements'
        if (queryMode === QueryMode.UPDATE) {
            request.url = getMutationEndpoint();
        } else if (queryMode === QueryMode.QUERY) {
            request.url = getQueryEndpoint();
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

    const getQueryEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}`;
    };

    const getMutationEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}/statements`;
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

    const setPrefixes = (namespacesResponse) => {
        const usedPrefixes = {};
        namespacesResponse.data.results.bindings.forEach(function (e) {
            usedPrefixes[e.prefix.value] = e.namespace.value;
        });
        $scope.prefixes = usedPrefixes;
    };

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
        // TODO: we should also watch for changes in namespaces
        // scope.$watch('namespaces', function () {});
    }

    // ================================
    // =     Setup output handlers    =
    // ================================

    /**
     * Handles the "query" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
     * request and the request object can be altered here, and it will be sent with these changes.
     * @param {QueryRequestEvent} queryRequest - the event payload containing the query and the request object.
     */
    const queryHandler = (queryRequest) => {
        updateRequestHeaders(queryRequest.request, queryRequest.queryMode, queryRequest.queryType, queryRequest.pageSize);
        changeEndpointByQueryType(queryRequest.queryMode, queryRequest.request);
        const pageNumber = queryRequest.getPageNumber();
        const pageSize = queryRequest.getPageSize();
        if (pageSize && pageNumber) {
            queryRequest.setOffset((pageNumber - 1) * (pageSize - 1));
            queryRequest.setLimit(pageSize);
        }
        queryRequest.setPageNumber(undefined);
        queryRequest.setPageSize(undefined);
    };
    outputHandlers.set(EventDataType.QUERY, queryHandler);


    /**
     * Handles the "queryExecuted" event emitted by ontotext-yasgui. The event is fired immediately after the request is executed, whether it succeeds or fails.
     * @param {QueryExecutedEvent} queryExecutedRequest - the event payload.
     */
    const queryExecutedHandler = (queryExecutedRequest) => {
        const connectorProgressModal = tabIdToConnectorProgressModalMapping.get(queryExecutedRequest.tabId);
        if (connectorProgressModal) {
            connectorProgressModal.dismiss();
            tabIdToConnectorProgressModalMapping.delete(queryExecutedRequest.tabId);
        }
    };
    outputHandlers.set(EventDataType.QUERY_EXECUTED, queryExecutedHandler);

    /**
     * Handles the "countQuery" event emitted by the ontotext-yasgui. The event is fired immediately before sending the
     * count query request and the request object can be altered here, and it will be sent with these changes.
     * @param {CountQueryRequestEvent} countQueryRequest - the event payload containing the query and the request object.
     */
    const countQueryRequestHandler = (countQueryRequest) => {
        updateRequestHeaders(countQueryRequest.request, countQueryRequest.queryMode, countQueryRequest.queryType, countQueryRequest.pageSize);
        changeEndpointByQueryType(countQueryRequest.queryMode, countQueryRequest.request);
        countQueryRequest.setPageSize(undefined);
        countQueryRequest.setPageNumber(undefined);
        countQueryRequest.setCount(1);
    };
    outputHandlers.set(EventDataType.COUNT_QUERY, countQueryRequestHandler);

    const extractTotalElements = (countResponse) => {
        if (countResponse.isResponseNumber()) {
            return countResponse.getResponseBody();
        }

        if (countResponse.isResponseArray()) {
            const body = countResponse.getResponseBody();
            if (body['http://www.ontotext.com/']) {
                return body['http://www.ontotext.com/']['http://www.ontotext.com/'][0].value;
            }
        }

        if (countResponse.hasBindingResponse()) {
            const body = countResponse.getResponseBody();
            if (body) {
                const result = body.results.bindings[0];
                const vars = body.head.vars;
                const bindingVar = Object.keys(result).find(function (b) {
                    return vars.indexOf(b) > -1 && !isNaN(result[b].value);
                });
                if (bindingVar.length > 0) {
                    return result[bindingVar].value;
                }
            }
        }
    };

    /**
     * Handles the "countQueryResponse" event emitted by the ontotext-yasgui. The event is fired immediately after receiving the
     * count query response and the response have to be parsed if needed. As result of response parsing the body of the response have to
     * contain "totalElements".
     * @param {CountQueryResponseEvent} countQueryResponseEvent - the event payload containing the response of count query.
     */
    const countQueryResponseHandler = (countQueryResponseEvent) => {
        countQueryResponseEvent.setTotalElements(extractTotalElements(countQueryResponseEvent));
    };
    outputHandlers.set(EventDataType.COUNT_QUERY_RESPONSE, countQueryResponseHandler);

    /**
     * Handles {@link EventDataType.DOWNLOAD_AS} event emitted by "ontotext-yasgui-web-component".
     *
     * @param {DownloadAsEvent}downloadAsEvent
     */
    const downloadAsHandler = (downloadAsEvent) => {
        const handler = downloadAsPluginNameToEventHandler.get(downloadAsEvent.pluginName);
        if (handler) {
            handler(downloadAsEvent);
        }
    };
    outputHandlers.set(EventDataType.DOWNLOAD_AS, downloadAsHandler);

    /**
     * Handles {@link EventDataType.NOTIFICATION_MESSAGE} event emitted by "ontotext-yasgui-web-component".
     * The event is fired when a message have to be shown to the user.
     *
     * @param {NotificationMessageEvent} notificationMessageEvent - the "ontotext-yasgui-web-component" event.
     */
    const notificationMessageHandler = (notificationMessageEvent) => {
        const notifyFunction = toastr[notificationMessageEvent.messageType];
        if (isFunction(notifyFunction)) {
            notifyFunction(notificationMessageEvent.message);
        }
    };
    outputHandlers.set(EventDataType.NOTIFICATION_MESSAGE, notificationMessageHandler);
    // ================================
    // =   Setup download handlers    =
    // ================================
    const downloadCurrentResults = (downloadAsEvent) => {
        if ("application/sparql-results+json" === downloadAsEvent.contentType) {
            ontoElement.getEmbeddedResultAsJson()
                .then((response) => {
                    const content = JSON.stringify(response, null, '\t');
                    downloadAsFile(`${getFileTimePrefix()}_queryResults.json`, downloadAsEvent.contentType, content);
                });
        } else if ("text/csv" === downloadAsEvent.contentType) {
            ontoElement.getEmbeddedResultAsCSV()
                .then((response) => {
                    downloadAsFile(`${getFileTimePrefix()}_queryResults.csv`, downloadAsEvent.contentType, response);
                });
        }
    };
    downloadAsPluginNameToEventHandler.set('extended_response', downloadCurrentResults);

    const getFileTimePrefix = () => {
        const now = new Date();
        return `${now.toLocaleDateString($scope.language)}_${now.toLocaleTimeString($scope.language)}`;
    };

    const downloadThroughServer = (downloadAsEvent) => {
        const query = downloadAsEvent.query;
        const infer = downloadAsEvent.infer;
        const sameAs = downloadAsEvent.sameAs;
        const accept = downloadAsEvent.contentType;
        const authToken = $jwtAuth.getAuthToken() || '';

        // TODO change it
        // Simple cross-browser download with a form
        const $wbDownload = $('#wb-download');
        $wbDownload.attr('action', getQueryEndpoint());
        $('#wb-download-query').val(query);
        $('#wb-download-infer').val(infer);
        $('#wb-download-sameAs').val(sameAs);
        $('#wb-auth-token').val(authToken);
        $('#wb-download-accept').val(accept);
        $wbDownload.submit();
    };
    downloadAsPluginNameToEventHandler.set(YasrPluginName.EXTENDED_TABLE, downloadThroughServer);

    init();
}
