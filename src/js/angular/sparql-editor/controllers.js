import {
    savedQueryResponseMapper, buildQueryModel
} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";
import 'angular/rest/connectors.rest.service';
import 'angular/externalsync/controllers';
import {YasguiComponentDirectiveUtil} from "../core/directives/yasgui-component/yasgui-component-directive.util";
import {QueryType} from "../models/ontotext-yasgui/query-type";
import {ConnectorCommand} from "../models/connectors/connector-command";
import {BeforeUpdateQueryResult, BeforeUpdateQueryResultStatus} from "../models/ontotext-yasgui/before-update-query-result";
import {EventDataType} from "../models/ontotext-yasgui/event-data-type";
import {decodeHTML} from "../../../app";
import {toBoolean} from "../utils/string-utils";
import {VIEW_SPARQL_EDITOR} from "../models/sparql/constants";
import {CancelAbortingQuery} from "../models/sparql/cancel-aborting-query";
import {QueryMode} from "../models/ontotext-yasgui/query-mode";
import 'angular/core/services/event-emitter-service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.rest.connectors.service',
    'graphdb.framework.externalsync.controllers',
    'graphdb.framework.utils.event-emitter-service',
    'graphdb.framework.utils.localstorageadapter'
];

angular
    .module('graphdb.framework.sparql-editor.controllers', modules)
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$q',
    '$location',
    '$languageService',
    '$jwtAuth',
    '$repositories',
    '$uibModal',
    'toastr',
    '$translate',
    'SparqlRestService',
    'ConnectorsRestService',
    'GuidesService',
    'ModalService',
    'MonitoringRestService',
    'EventEmitterService',
    'LocalStorageAdapter',
    'LSKeys'];

function SparqlEditorCtrl($rootScope,
                          $scope,
                          $q,
                          $location,
                          $languageService,
                          $jwtAuth,
                          $repositories,
                          $uibModal,
                          toastr,
                          $translate,
                          SparqlRestService,
                          ConnectorsRestService,
                          GuidesService,
                          ModalService,
                          MonitoringRestService,
                          EventEmitterService,
                          LocalStorageAdapter,
                          LSKeys) {
    this.repository = '';

    const QUERY_EDITOR_ID = '#query-editor';
    let activeRepository = $repositories.getActiveRepository();

    /**
     * @type {OntotextYasguiConfig}
     */
    $scope.yasguiConfig = undefined;
    $scope.savedQueryConfig = undefined;
    $scope.prefixes = {};
    $scope.inferUserSetting = true;
    $scope.sameAsUserSetting = true;

    const tabIdToConnectorProgressModalMapping = new Map();
    let internallyReloaded = false;

    // =========================
    // Public functions
    // =========================
    /**
     * Updates the Yasgui configuration
     * @param {boolean} clearYasguiState if set to true, the Yasgui will reinitialize and clear all tab results. Queries will remain.
     */
    $scope.updateConfig = (clearYasguiState) => {
        $scope.yasguiConfig = {
            endpoint: getEndpoint,
            componentId: VIEW_SPARQL_EDITOR,
            prefixes: $scope.prefixes,
            infer: $scope.inferUserSetting,
            sameAs: $scope.sameAsUserSetting,
            yasrToolbarPlugins: [exploreVisualGraphYasrToolbarElementBuilder],
            beforeUpdateQuery: getBeforeUpdateQueryHandler(),
            outputHandlers: new Map([
                [EventDataType.QUERY_EXECUTED, queryExecutedHandler],
                [EventDataType.REQUEST_ABORTED, requestAbortedHandler]
            ]),
            clearState: clearYasguiState !== undefined ? clearYasguiState : false
        };
    };

    $scope.getActiveRepositoryNoError = () => {
        return activeRepository;
    };

    // =========================
    // Private functions
    // =========================
    const getYasqe = (yasgui) => {
        const tab = yasgui.getTab();
        if (!tab) {
            return;
        }
        return tab.getYasqe();
    };

    const getEndpoint = (yasgui) => {
        const yasqe = getYasqe(yasgui);
        if (!yasqe) {
            // this can happen if open saprql view for first time (browser local store is clear);
            return;
        }
        return $repositories.resolveSparqlEndpoint(yasqe.getQueryMode());
    };

    /**
     * Initializes the editor from the URL parameters.
     * @param {boolean} clearYasguiState if set to true, the Yasgui will reinitialize and clear all tab results. Queries will remain.
     * The default is false.
     */
    const initViewFromUrlParams = (clearYasguiState = false) => {
        $scope.updateConfig(clearYasguiState);
        const queryParams = $location.search();
        if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared saved query link
            initTabFromSavedQuery(queryParams);
        } else if (queryParams.hasOwnProperty(RouteConstants.query)) {
            // init new tab from shared query link
            initTabFromSharedQuery(queryParams);
        } else if (GuidesService.isActive()) {
            openNewTab();
        }
    };

    // ================================
    // =     Setup output handlers
    // ================================
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

    /**
     * Handles the "requestAborted" event emitted by the ontotext-yasgui. The event is fired when a request is aborted.
     *
     * @param {RequestAbortedEvent} requestAbortedEvent the event payload containing the request object and the query mode.
     */
    const requestAbortedHandler = (requestAbortedEvent) => {
        if (requestAbortedEvent && QueryMode.UPDATE !== requestAbortedEvent.queryMode) {
            const repository = requestAbortedEvent.getRepository();
            const currentTrackAlias = requestAbortedEvent.getQueryTrackAlias();
            if (repository && currentTrackAlias) {
                MonitoringRestService.deleteQuery(currentTrackAlias, repository);
            }
        }
    };

    // =========================
    // Private function
    // =========================

    const initTabFromSavedQuery = (queryParams) => {
        const savedQueryName = queryParams[RouteConstants.savedQueryName];
        const savedQueryOwner = queryParams[RouteConstants.savedQueryOwner];
        SparqlRestService.getSavedQuery(savedQueryName, savedQueryOwner).then((res) => {
            const savedQuery = savedQueryResponseMapper(res);
            openNewTab(savedQuery)
                .then(autoExecuteQueryIfRequested)
                .finally(clearUrlParameters);
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
        openNewTab(sharedQueryModel)
            .then(autoExecuteQueryIfRequested)
            .finally(clearUrlParameters);
    };

    /**
     * Open a new tab with query described in <code>sparqlQuery</code>.
     *
     * @param {TabQueryModel} sparqlQuery
     *
     * @return {Promise<void>}
     */
    const openNewTab = (sparqlQuery) => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(QUERY_EDITOR_ID)
            .then((yasguiComponent) => yasguiComponent.openTab(sparqlQuery))
            .then((tab) => YasguiComponentDirectiveUtil.highlightTabName(tab));
    };

    const clearUrlParameters = () => {
        internallyReloaded = true;
        $location.search({});
        // Replace current URL without adding a new history entry
        $location.replace();
    };

    const autoExecuteQueryIfRequested = () => {
        const isRequested = toBoolean($location.search().execute);
        if (isRequested) {
            return YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync(QUERY_EDITOR_ID)
                .then(getQueryMode)
                .then(confirmAndExecuteQuery);
        }
        return Promise.resolve();
    };

    const getQueryMode = (yasguiComponent) => {
        return yasguiComponent.getQueryMode()
            .then((queryMode) => {
                return {yasguiComponent, queryMode};
            });
    };

    const confirmAndExecuteQuery = ({yasguiComponent, queryMode}) => {
        if (queryMode !== 'update') {
            return yasguiComponent.query();
        }

        return new Promise((resolve) => {
            const title = $translate.instant('confirm.execute');
            const message = decodeHTML($translate.instant('query.editor.automatically.execute.update.warning'));
            ModalService.openConfirmation(title, message, () => resolve(yasguiComponent.query()), () => resolve());
        });
    };

    const setInferAndSameAs = (principal) => {
        $scope.inferUserSetting = principal.appSettings.DEFAULT_INFERENCE;
        $scope.sameAsUserSetting = principal.appSettings.DEFAULT_SAMEAS;
    };

    const exploreVisualGraphYasrToolbarElementBuilder = {
        createElement: (yasr) => {
            const buttonName = document.createElement('span');
            buttonName.classList.add("explore-visual-graph-button-name");
            const exploreVisualButtonWrapperElement = document.createElement('button');
            exploreVisualButtonWrapperElement.classList.add("explore-visual-graph-button");
            exploreVisualButtonWrapperElement.classList.add("icon-data");
            exploreVisualButtonWrapperElement.onclick = function () {
                const paramsToParse = {
                    query: yasr.yasqe.getValue(),
                    sameAs: yasr.yasqe.getSameAs(),
                    inference: yasr.yasqe.getInfer()
                };
                $location.path('graphs-visualizations').search(paramsToParse);
            };
            exploreVisualButtonWrapperElement.appendChild(buttonName);
            return exploreVisualButtonWrapperElement;
        },
        updateElement: (element, yasr) => {
            element.classList.add('hidden');
            if (!yasr.hasResults()) {
                return;
            }
            const queryType = yasr.yasqe.getQueryType();

            if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
                element.classList.remove('hidden');
            }
            element.querySelector('.explore-visual-graph-button-name').innerText = $translate.instant("query.editor.visual.btn");
        },
        getOrder: () => {
            return 2;
        }
    };

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
        return ConnectorsRestService.checkConnector(query)
            .then((response) => {
                if (!response.data.command) {
                    return toNoCommandResponse();
                }
                if (!response.data.hasSupport) {
                    return toHasNotSupport(response);
                }

                if (ConnectorCommand.CREATE === response.data.command) {
                    return toCreateCommandResponse(response, tabId);
                }

                if (ConnectorCommand.REPAIR === response.data.command) {
                    return toRepairCommandResponse(response, tabId);
                }

                if (ConnectorCommand.DROP === response.data.command) {
                    return toDropCommandResponse(response);
                }
            }).catch((error) => {
                // For some reason we couldn't check if this is a connector update, so just catch the exception,
                // to not stop the execution of query.
                console.log('Checking connector error: ', error);
            });
    };

    const getExitPageConfirmMessage = (ongoingRequestsInfo) => {
        let exitPageConfirmMessage = "view.sparql-editor.leave_page.run_queries.confirmation.";
        if (!ongoingRequestsInfo || ongoingRequestsInfo.queriesCount < 1) {
            exitPageConfirmMessage += "none_queries_";
        } else if (ongoingRequestsInfo.queriesCount === 1) {
            exitPageConfirmMessage += "one_query_";
        } else {
            exitPageConfirmMessage += "queries_";
        }

        if (!ongoingRequestsInfo.updatesCount || ongoingRequestsInfo.updatesCount === 0) {
            exitPageConfirmMessage += "non_updates";
        } else if (ongoingRequestsInfo.updatesCount === 1) {
            exitPageConfirmMessage += "one_update";
        } else {
            exitPageConfirmMessage += "updates";
        }

        exitPageConfirmMessage += ".message";
        const params= {
                queriesCount: ongoingRequestsInfo.queriesCount,
                updatesCount: ongoingRequestsInfo.updatesCount
            };
        return $translate.instant(exitPageConfirmMessage, params);
    };

    // Initialization and bootstrap
    const init = (clearYasguiState) => {
        // This script check is required, because of the following scenario:
        // I am in the SPARQL view;
        // Then I go to a different view and change the language;
        // Then I return to the SPARQL view. I will see that the Google chart and Pivot table will have their
        // original scripts loaded still.
        // THE FIX: Get all the scripts (if there are none, the correct language will be loaded). If there are
        // scripts, and they don't match those, which are loaded already, the page needs to reload when opening
        // the SPARQL view, otherwise the Google chart and Pivot table configs will be in the old language.
        const googleScripts = document.querySelectorAll(`script[src*="https://www.gstatic.com/"]`);
        if (googleScripts.length > 0) {
            const currentLang = $languageService.getLanguage();
            let searchTerm = 'module.js';
            if ('en' !== currentLang) {
                searchTerm = `module__${currentLang}.js`;
            }
            if (!Array.prototype.some.call(googleScripts, (script) => script.src.includes(searchTerm))) {
                location.reload();
                return;
            }
        }
        Promise.all([$jwtAuth.getPrincipal(), $repositories.getPrefixes(activeRepository)])
            .then(([principal, usedPrefixes]) => {
                $scope.prefixes = usedPrefixes;
                setInferAndSameAs(principal);
                // check is there is a saved query or query url parameter and init the editor
                initViewFromUrlParams(clearYasguiState);
            });
        // TODO: we should also watch for changes in namespaces
        // scope.$watch('namespaces', function () {});
    };

    // =========================
    // Event handlers
    // =========================
    const subscriptions = [];

    const repositoryChangedHandler = () => {
        activeRepository= $repositories.getActiveRepository();
        if (LocalStorageAdapter.get(LSKeys.SPARQL_LAST_REPO) !== activeRepository) {
            init(true);
            persistLasstUsedRepository();
        } else {
            init(false);
        }
    };

    const beforeunloadHandler = (event) => {
        const ontotextYasguiElement = YasguiComponentDirectiveUtil.getOntotextYasguiElement(QUERY_EDITOR_ID);
        if (!ontotextYasguiElement) {
            return;

        }
        // If we set event.returnValue, the browser will prompt the user for confirmation to leave the page,
        // but we don't have a way to handle the user's choice.
        // Therefore, we can't take any action, so we simply proceed to abort all requests.
        ontotextYasguiElement.abortAllRequests().then(() => {});
    };

    window.addEventListener('beforeunload', beforeunloadHandler);

    const confirmIfHaveRunQuery = (ongoingRequestsInfo) => new Promise((resolve, reject) => {

        if (!ongoingRequestsInfo || ongoingRequestsInfo.queriesCount < 1 && ongoingRequestsInfo.updatesCount < 1) {
            resolve();
            return;
        }

        const title = $translate.instant('common.confirm');
        const message = decodeHTML(getExitPageConfirmMessage(ongoingRequestsInfo));
        ModalService.openSimpleModal({
            title,
            message,
            warning: true
        }).result.then(function () {
            resolve();
        }, function () {
            reject(new CancelAbortingQuery());
        });
    });
    let queriesAreCanceled = undefined;
    const locationChangeHandler = (event) => {
        if (internallyReloaded) {
            internallyReloaded = false;
            return;
        }
        const ontotextYasguiElement = YasguiComponentDirectiveUtil.getOntotextYasguiElement(QUERY_EDITOR_ID);
        if (!ontotextYasguiElement || queriesAreCanceled) {
            return;
        }
        event.preventDefault();
        const newPath = $location.path();
        const searches = $location.search();
        // First, we check if there are any ongoing requests initiated by the user.
        // If the user has ongoing requests, we request confirmation to abort them.
        // If the user confirms or there are no ongoing requests, we call the "abortAllRequests" method. This method will abort all requests.
        ontotextYasguiElement
            .getOngoingRequestsInfo()
            .then((hasRunQuery) => confirmIfHaveRunQuery(hasRunQuery))
            .then(() => ontotextYasguiElement.abortAllRequests())
            .then(() => {
                queriesAreCanceled = true;
                $location.path(newPath).search(searches);
            })
            .catch((error) => {
                if (!(error instanceof CancelAbortingQuery)) {
                    throw error;
                }
            });
    };

    subscriptions.push($rootScope.$on('$locationChangeStart', locationChangeHandler));

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
        window.removeEventListener('beforeunload', beforeunloadHandler);
    };

    const finalizeAndDestroy = () => {
        persistLasstUsedRepository();
        removeAllListeners();
    };

    const persistLasstUsedRepository = () => {
        // The active repository is set when the controller is initialized and when the repository is changed.
        // It holds the actual repository when the YASGUI is initialized. DON'T use runtime fetching of the actual repository here, because there is a scenario:
        // 1. Open a tab with the SPARQL view open;
        // 2. Open the SPARQL view in another tab and execute a query;
        // 3. Switch to the repositories view and change the repository;
        // 4. Switch back to the SPARQL view, and the YASR is not cleared.
        // The problem occurs because of the second tab. When the repository is changed, its ID is persisted to local storage, which triggers the "storage" event to be fired.
        // In the main controller, a listener has been registered to listen to that event and refresh the page outside of the Angular scope.
        // Reloading the page triggers the destruction of the component and persistence of the active repository. The reloading of the page is out of the Angular scope, so the "activeRepository"
        // holds the real repository when the YASGUI is created. If we use $$repositories.getActiveRepository(), the new value will be fetched, which in this case will be incorrect.
        LocalStorageAdapter.set(LSKeys.SPARQL_LAST_REPO, activeRepository);
    }

    subscriptions.push(
        $scope.$on('language-changed', function () {
            location.reload();
        })
    );
    subscriptions.push(
        EventEmitterService.subscribe('before-language-change', function (args) {
                return new Promise((resolve) => {
                    ModalService.openSimpleModal({
                        title: $translate.instant('query.editor.language.change.warning.title'),
                        message: $translate.instant('query.editor.reload.page.warning'),
                        warning: true
                    }).result.then(function () {
                        resolve(args);
                    }, function () {
                        args.cancel = true;
                        resolve(args);
                    });
                });
            }
        ));

    // Deregister the watcher when the scope/directive is destroyed
    subscriptions.push($scope.$on('$destroy', finalizeAndDestroy));

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, repositoryChangedHandler));
}
