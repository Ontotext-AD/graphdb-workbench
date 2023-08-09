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
import {TabQueryModel} from "../models/sparql/tab-query-model";
import {toBoolean} from "../utils/string-utils";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.rest.connectors.service',
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
    '$uibModal',
    'toastr',
    '$translate',
    'SparqlRestService',
    'ConnectorsRestService',
    'GuidesService',
    'ModalService'];

function SparqlEditorCtrl($scope,
                          $q,
                          $location,
                          $jwtAuth,
                          $repositories,
                          $uibModal,
                          toastr,
                          $translate,
                          SparqlRestService,
                          ConnectorsRestService,
                          GuidesService,
                          ModalService) {
    this.repository = '';

    $scope.yasguiConfig = undefined;
    $scope.savedQueryConfig = undefined;
    $scope.prefixes = {};
    $scope.inferUserSetting = true;
    $scope.sameAsUserSetting = true;

    const tabIdToConnectorProgressModalMapping = new Map();

    // =========================
    // Public functions
    // =========================
    $scope.updateConfig = () => {
        $scope.yasguiConfig = {
            endpoint: getQueryEndpoint(),
            componentId: 'graphdb-workbench-sparql-editor',
            prefixes: $scope.prefixes,
            infer: $scope.inferUserSetting,
            sameAs: $scope.sameAsUserSetting,
            yasrToolbarPlugins: [exploreVisualGraphYasrToolbarElementBuilder],
            beforeUpdateQuery: getBeforeUpdateQueryHandler(),
            outputHandlers: new Map([[EventDataType.QUERY_EXECUTED, queryExecutedHandler]])
        };
    };

    // =========================
    // Private functions
    // =========================
    const initViewFromUrlParams = () => {
        $scope.updateConfig();
        const queryParams = $location.search();
        if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared saved query link
            initTabFromSavedQuery(queryParams);
        } else if (queryParams.hasOwnProperty(RouteConstants.query)) {
            // init new tab from shared query link
            initTabFromSharedQuery(queryParams);
        } else if (GuidesService.isActive()) {
            $scope.updateConfig();
            const sparqlQuery = new TabQueryModel();
            openNewTab(sparqlQuery);
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

    // =========================
    // Private function
    // =========================

    const getQueryEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}`;
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
            openNewTab(savedQuery, true);
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
        openNewTab(sharedQueryModel, true);
    };

    /**
     * Open a new tab with query described in <code>sparqlQuery</code>.
     *
     * @param {TabQueryModel} sparqlQuery
     * @param {boolean} executeWhenOpen
     */
    const openNewTab = (sparqlQuery, executeWhenOpen = false) => {
        YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync('#query-editor')
            .then((yasguiComponent) => yasguiComponent.openTab(sparqlQuery));

        if (executeWhenOpen) {
            autoExecuteQueryIfRequested();
        }
    };

    const autoExecuteQueryIfRequested = () => {
        const isRequested = toBoolean($location.search().execute);
        if (isRequested) {
            YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync('#query-editor')
                .then(getQueryMode)
                .then(confirmAndExecuteQuery);
        }
    };

    const getQueryMode = (yasguiComponent) => {
        yasguiComponent.getQueryMode()
            .then((queryMode) => {
                return {yasguiComponent, queryMode};
            });
    };

    const confirmAndExecuteQuery = ([yasguiComponent, queryMode]) => {
        const runQuery = () => {
            yasguiComponent.query().then();
        };

        if (queryMode === 'update') {
            const title = $translate.instant('confirm.execute');
            const message = decodeHTML($translate.instant('query.editor.automatically.execute.update.warning'));
            ModalService.openConfirmation(title, message, runQuery);
        } else {
            runQuery();
        }
    };

    const setInferAndSameAs = (principal) => {
        $scope.inferUserSetting = principal.appSettings.DEFAULT_INFERENCE;
        $scope.sameAsUserSetting = principal.appSettings.DEFAULT_SAMEAS;
    };

    const exploreVisualGraphYasrToolbarElementBuilder = {
        createElement: (yasr) => {
            const buttonName = document.createElement('span');
            buttonName.classList.add("explore-visual-graph-button-name");
            const exploreVisualButtonWrapperElement = document.createElement('div');
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

    // Initialization and bootstrap
    const init = () => {
        Promise.all([$jwtAuth.getPrincipal(), $repositories.getPrefixes($repositories.getActiveRepository())])
            .then(([principal, usedPrefixes]) => {
                $scope.prefixes = usedPrefixes;
                setInferAndSameAs(principal);
                // check is there is a savedquery or query url parameter and init the editor
                initViewFromUrlParams();

            });
        // TODO: we should also watch for changes in namespaces
        // scope.$watch('namespaces', function () {});
    };

    // =========================
    // Event handlers
    // =========================
    const subscriptions = [];

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };
    /**
     * When the repository gets changed through the UI, we need to update the yasgui configuration so that new queries
     * to be issued against the new repository.
     */
    subscriptions.push($scope.$on('repositoryIsSet', init));

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', removeAllListeners);

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    const repoIsInitialized = $scope.$watch(function () {
        return $scope.getActiveRepositoryObject();
    }, function (activeRepo) {
        if (activeRepo) {
            init();
            repoIsInitialized();
        }
    });
}
