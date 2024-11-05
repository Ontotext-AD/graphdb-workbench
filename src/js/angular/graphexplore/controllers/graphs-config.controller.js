import 'angular/utils/notifications';
import 'angular/utils/local-storage-adapter';
import 'angular/core/services/workbench-context.service';
import {YasqeMode} from "../../models/ontotext-yasgui/yasqe-mode";
import {RenderingMode} from "../../models/ontotext-yasgui/rendering-mode";
import {
    INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION,
    YasguiComponentDirectiveUtil
} from "../../core/directives/yasgui-component/yasgui-component-directive.util";
import {GraphsConfig, StartMode} from "../../models/graphs/graphs-config";
import {mapGraphConfigSamplesToGraphConfigs} from "../../rest/mappers/graphs-config-mapper";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";

angular
    .module('graphdb.framework.graphexplore.controllers.graphviz.config', [
        'graphdb.framework.utils.notifications',
        'graphdb.framework.utils.localstorageadapter',
        'graphdb.core.services.workbench-context',
        'graphdb.framework.core.services.rdf4j.repositories'

    ])
    .controller('GraphConfigCtrl', GraphConfigCtrl);

GraphConfigCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    '$location',
    'toastr',
    '$repositories',
    'SparqlRestService',
    '$filter',
    'GraphConfigRestService',
    '$routeParams',
    'Notifications',
    'LocalStorageAdapter',
    'LSKeys',
    '$translate',
    'ModalService',
    'WorkbenchContextService',
    'RDF4JRepositoriesService'
];

function GraphConfigCtrl(
    $rootScope,
    $scope,
    $timeout,
    $location,
    toastr,
    $repositories,
    SparqlRestService,
    $filter,
    GraphConfigRestService,
    $routeParams,
    Notifications,
    LocalStorageAdapter,
    LSKeys,
    $translate,
    ModalService,
    WorkbenchContextService,
    RDF4JRepositoriesService
) {

    // =========================
    // Public fields
    // =========================

    /**
     * @type {GraphsConfig}
     */
    $scope.newConfig = new GraphsConfig();
    /**
     * @type {GraphsConfig|undefined}
     */
    $scope.revertConfig = undefined;

    $scope.page = 1;
    $scope.totalPages = 5;
    $scope.helpHidden = LocalStorageAdapter.get(LSKeys.HIDE_GRAPH_CONFIG_HELP) === 1;
    $scope.isUpdate = false;
    $scope.shared = false;
    /**
     * Flag showing if the user have permission to write in the currently selected repository.
     * @type {boolean}
     */
    $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
    $scope.samples = [];
    $scope.tabConfig = {
        inference: $scope.newConfig.startQueryIncludeInferred,
        sameAs: $scope.newConfig.startQuerySameAs
    };
    /**
     * @type {boolean|undefined}
     */
    $scope.isAutocompleteEnabled = undefined;
    /**
     * @type {NamespacesListModel|undefined}
     */
    $scope.repositoryNamespaces = undefined;

    $scope.tabsViewModel = [];

    // =========================
    // Private fields
    // =========================

    let selectedFixedNodeChanged;
    const configName = $routeParams.configName;
    const activeRepository = $repositories.getActiveRepository();
    const DISABLE_YASQE_BUTTONS_CONFIGURATION = [
        {
            name: 'createSavedQuery',
            visible: false
        }, {
            name: 'showSavedQueries',
            visible: false
        }, {
            name: 'shareQuery',
            visible: false
        }, {
            name: 'includeInferredStatements',
            visible: false
        }
    ];

    // =========================
    // Public functions
    // =========================

    /**
     * @param {number|undefined} value
     */
    $scope.toggleHelp = (value) => {
        if (value === undefined) {
            value = LocalStorageAdapter.get(LSKeys.HIDE_GRAPH_CONFIG_HELP);
        }
        if (value !== 1) {
            LocalStorageAdapter.set(LSKeys.HIDE_GRAPH_CONFIG_HELP, 1);
            $scope.helpHidden = true;
        } else {
            LocalStorageAdapter.set(LSKeys.HIDE_GRAPH_CONFIG_HELP, 0);
            $scope.helpHidden = false;
        }
    };

    /**
     * @param {string} uri
     * @param {string} label
     */
    $scope.fixedVisualCallback = (uri, label) => {
        $scope.newConfig.startIRI = uri;
        $scope.newConfig.startIRILabel = label;
        selectedFixedNodeChanged = true;
    };

    /**
     * A filter used to filter query samples during the rendering.
     * @param {GraphsConfig} sample
     * @return {boolean}
     */
    $scope.isDefaultGraph = (sample) => {
        return sample.isDefaultGraph();
    };

    /**
     * A filter used to filter query samples during the rendering.
     * @param {GraphsConfig} sample
     * @return {boolean}
     */
    $scope.isUserGraph = (sample) => {
        return !sample.isDefaultGraph();
    };

    /**
     * @param {GraphsConfig} sample
     * @param {string} property
     * @return {string|*}
     */
    $scope.getSampleName = (sample, property) => {
        if (!sample) {
            return '';
        }
        const propertyDescription = sample.getPropertyDescription(property);
        if (propertyDescription) {
            // Sample has description, use it
            return propertyDescription;
        } else {
            // Sample is a copy of existing config, prepend Copy of to name
            return sample.id ? 'Copy of ' + sample.name : sample.name;
        }
    };

    /**
     * @param {GraphsConfig} payload
     */
    $scope.createGraphConfig = (payload) => {
        GraphConfigRestService.createGraphConfig(payload)
            .success(async function () {
                await Notifications.showToastMessageWithDelay('graphexplore.saved.new.config');
                $location.url('graphs-visualizations');
            }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.could.not.create'));
            });
    };

    /**
     * @param {GraphsConfig} payload
     */
    $scope.updateGraphConfig = (payload) => {
        GraphConfigRestService.updateGraphConfig(payload)
            .success(async function () {
                await Notifications.showToastMessageWithDelay('graphexplore.saved.config');
                $location.url('graphs-visualizations');
            }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.could.not.save'));
            });
    };

    /**
     * @param {number} nextPage
     */
    $scope.goToPage = (nextPage) => {
        if ($scope.page === nextPage) {
            // already there
            return;
        }

        validateCurrentPage(() => {
            $scope.showEditor();
            $scope.page = nextPage;
        });
    };

    $scope.goToPreviousPage = () => {
        if ($scope.page > 1) {
            $scope.goToPage($scope.page - 1);
        }

        if (isBaseConfig()) {
            selectedFixedNodeChanged = false;
        }
    };

    $scope.goToNextPage = () => {
        broadcastAddStartFixedNodeEvent();
        if (!$scope.newConfig.isStartMode(StartMode.NODE) || selectedFixedNodeChanged) {
            $scope.goToPage($scope.page + 1);
        }
    };

    $scope.saveGraphConfig = () => {
        broadcastAddStartFixedNodeEvent();

        if (isBaseConfig() && !selectedFixedNodeChanged) {
            return;
        }

        $scope.newConfig.startQueryIncludeInferred = $scope.tabConfig.inference;
        $scope.newConfig.startQuerySameAs = $scope.tabConfig.sameAs;

        validateCurrentPage(() => {
            if (!$scope.newConfig.name) {
                showInvalidMsg($translate.instant('graphexplore.provide.config.name'));
                return;
            }
            $scope.queryEditorIsDirty = false;
            if ($scope.isUpdate) {
                $scope.updateGraphConfig($scope.newConfig.toSavePayload());
            } else {
                $scope.createGraphConfig($scope.newConfig.toSavePayload());
            }
        });
    };

    /**
     * Sets the query selected by the user through the sample queries list in the graphs config list.
     * @param {string} query
     * @return {Promise<void>}
     */
    $scope.setQuery = async (query) => {
        const newQuery = query ? query : ' ';
        const yasguiInstance = await getYasguiInstance()
        yasguiInstance.setQuery(newQuery);
        $scope.markDirty();
    };

    $scope.markDirty = async () => {
        if ($scope.revertConfig) {
            const q1 = $scope.revertConfig.getQueryType($scope.page);
            const q2 = await getYasqeQuery();
            $scope.queryEditorIsDirty = q1 !== q2;
        }
    };

    $scope.showEditor = () => {
        $scope.viewMode = 'yasr';
        abortQuery();
        switchToYasqe();
    };

    $scope.showPreview = () => {
        $scope.viewMode = 'editor';
        runQuery()
    };

    $scope.revertEditor = () => {
        $scope.setQuery($scope.revertConfig.getQueryType($scope.page));
        $scope.queryEditorIsDirty = false;
    };

    // =========================
    // Private functions
    // =========================
    /**
     * Fetches yasgui component.
     *
     * @return {Promise<YasguiComponent>}
     */
    const getYasguiInstance = () => {
        return YasguiComponentDirectiveUtil.getOntotextYasguiElementAsync('#query-editor');
    }

    const runQuery = async (changePage, explain) => {
        const yasguiInstance = await getYasguiInstance()
        const queryType = await yasguiInstance.getQueryType();
        if (explain && !(queryType === 'SELECT' || queryType === 'CONSTRUCT' || queryType === 'DESCRIBE')) {
            toastr.warning($translate.instant('query.editor.warning.msg'));
            return;
        }

        const queryMode = await yasguiInstance.getQueryMode();
        if (queryMode === 'update') {
            toastr.warning($translate.instant('cannot.execute.update.error'));
            return;
        }

        if (!$scope.queryIsRunning) {
            // Hides the editor and shows the yasr results
            $scope.viewMode = 'editor';

            // this breaks a test - probably something with the queryIsRunning flag
            // setLoader(true, $translate.instant('evaluating.query.msg'));

            executeYasqeQuery();
        }
    };

    const executeYasqeQuery = async () => {
        const yasguiInstance = await getYasguiInstance();
        yasguiInstance.query(RenderingMode.YASR);
    }

    const switchToYasqe = async () => {
        const yasguiInstance = await getYasguiInstance()
        return yasguiInstance.changeRenderMode(RenderingMode.YASQE);
    }

    const switchToYasr = async () => {
        const yasguiInstance = await getYasguiInstance()
        yasguiInstance.changeRenderMode(RenderingMode.YASR);
    }

    const getYasqeQuery = async () => {
        const yasguiInstance = await getYasguiInstance()
        return yasguiInstance.getQuery();
    }

    const abortQuery = async () => {
        const yasguiInstance = await getYasguiInstance()
        return yasguiInstance.abortQuery();
    }

    const getNamespaces = () => {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, $translate.instant('common.refreshing.namespaces'), $translate.instant('common.extra.message'));
        $repositories.getPrefixes($repositories.getActiveRepository())
            .then((prefixes) => {
                $scope.namespaces = prefixes;
            }).catch(function (data) {
            $scope.repositoryError = getError(data);
        }).finally(function () {
                // Signals namespaces were fetched => loader will be hidden
                setLoader(false);
            });
    }

    const updateModel = async () => {
        const yasguiInstance = await getYasguiInstance()
        /** @type string */
        let query = await yasguiInstance.getQuery();
        query = query.trim();
        return $scope.newConfig.updateModel(query, $scope.page);
    };

    const validateCurrentPage = async (successCallback) => {
        /** @type {GraphsConfig} */
        const newConfig = await updateModel();

        if ($scope.page === 1) {
            if (newConfig.isStartMode(StartMode.NODE) && !newConfig.startIRI) {
                showInvalidMsg($translate.instant('graphexplore.select.start.node'));
            } else if (newConfig.isStartMode(StartMode.QUERY) && !newConfig.startGraphQuery) {
                showInvalidMsg($translate.instant('graphexplore.provide.query'));
            } else if (newConfig.isStartMode(StartMode.QUERY)) {
                validateQueryWithCallback(successCallback, newConfig.startGraphQuery, 'graph')
            } else {
                successCallback();
            }
        } else if ($scope.page === 2) {
            validateQueryWithCallback(successCallback, newConfig.expandQuery, 'construct', ['node'])
        } else if ($scope.page === 3) {
            validateQueryWithCallback(successCallback, newConfig.resourceQuery, 'tuple', ['node'], [], ['type', 'label', 'comment', 'rank']);
        } else if ($scope.page === 4) {
            validateQueryWithCallback(successCallback, newConfig.predicateLabelQuery, 'tuple', ['edge'], ['label']);
        } else if ($scope.page === 5) {
            validateQueryWithCallback(successCallback, newConfig.resourcePropertiesQuery, 'tuple', ['node'], ['property', 'value']);
        }
    };

    const getGraphConfigSamples = () => {
        GraphConfigRestService.getGraphConfigSamples()
            .success(function (data) {
                $scope.samples = mapGraphConfigSamplesToGraphConfigs(data)
                    .filter((graphConfig) => {
                        // Skip the currently edited config from samples and store it into a revert variable
                        if (!graphConfig.id || $scope.newConfig.id !== graphConfig.id) {
                            return true;
                        } else {
                            $scope.revertConfig = graphConfig;
                            return false;
                        }
                    });
            }).error(function (data) {
                toastr.error(getError(data), $translate.instant('graphexplore.error.graph.configs'));
            });
    };

    /**
     * Updates the position of the query editor to match the current div placeholder and sets the editor's query to the
     * relevant query from the model.
     */
    const updateEditor = () => {
        $scope.tabConfig.inference = $scope.newConfig.startQueryIncludeInferred;
        $scope.tabConfig.sameAs = $scope.newConfig.startQuerySameAs;
        $scope.setQuery($scope.newConfig.getQueryType($scope.page))
    };

    const showInvalidMsg = (message) => {
        toastr.warning(message);
    };

    const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
        $scope.isAutocompleteEnabled = autocompleteEnabled;
    };

    const onSelectedRepositoryIdUpdated = (repositoryId) => {
        if (!repositoryId) {
            $scope.repositoryNamespaces = new NamespacesListModel();
            return;
        }
        RDF4JRepositoriesService.getNamespaces(repositoryId)
            .then((repositoryNamespaces) => {
                $scope.repositoryNamespaces = repositoryNamespaces;
            });
    };

    const validateQueryWithCallback = (successCallback, query, queryType, params, all, oneOf) => {
        if (!query) {
            successCallback();
        } else {
            GraphConfigRestService.validateQuery(query, queryType, params, all, oneOf)
                .success(() => {
                    successCallback();
                }).error((data) => {
                    showInvalidMsg(getError(data));
                });
        }
    };

    const broadcastAddStartFixedNodeEvent = () => {
        if (isBaseConfig()) {
            $scope.$broadcast('addStartFixedNodeAutomatically', {startIRI: $scope.newConfig.startIRI});
        }
    }

    const isBaseConfig = () => {
        return $scope.page === 1 && $scope.newConfig.isStartMode(StartMode.NODE);
    }

    const initForConfig = () => {
        getGraphConfigSamples();
    }

    const getQueryEndpoint = () => {
        return `repositories/${$repositories.getActiveRepository()}`;
    };

    const defaultYasguiConfig = {
        endpoint: getQueryEndpoint,
        showEditorTabs: false,
        showToolbar: false,
        showResultTabs: false,
        showYasqeActionButtons: false,
        yasqeActionButtons: INFERRED_AND_SAME_AS_BUTTONS_CONFIGURATION,
        showQueryButton: false,
        initialQuery: ' ',
        componentId: 'graphs-config',
        render: RenderingMode.YASQE,
        maxPersistentResponseSize: 0,
        showYasqeResizer: false,
        yasqeMode: YasqeMode.PROTECTED,
        infer: $scope.newConfig.startQueryIncludeInferred,
        sameAs: $scope.newConfig.startQuerySameAs
    };

    const initYasgui = (prefixes) => {
        // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result
        // and the "ontotext-yasgui" readOnly configuration may be incorrect.
        const repoIsInitialized = $scope.$watch(function () {
            return $scope.getActiveRepositoryObject();
        }, function (activeRepo) {
            if (activeRepo) {
                $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
                const config = angular.extend({}, defaultYasguiConfig, {
                    prefixes: prefixes,
                    yasqeMode: $scope.canWriteActiveRepo() ? YasqeMode.WRITE : YasqeMode.PROTECTED
                });
                $scope.yasguiConfig = config;
                repoIsInitialized();
            }
        });
    }

    const setLoader = (isRunning, progressMessage, extraMessage) => {
        $scope.queryIsRunning = isRunning;
    };

    const openConfirmDialog = (title, message, onConfirm, onCancel) => {
        ModalService.openSimpleModal({
            title,
            message,
            warning: true
        }).result.then(function () {
            if (angular.isFunction(onConfirm)) {
                onConfirm();
            }
        }, function () {
            if (angular.isFunction(onCancel)) {
                onCancel();
            }
        });
    };

    const locationChangedHandler = (event, newPath) => {
        if ($scope.queryEditorIsDirty) {
            event.preventDefault();
            const title = $translate.instant('common.confirm');
            const message = $translate.instant('visual.config.warning.unsaved.changes');
            const onConfirm = () => {
                unsubscribeListeners();
                const baseLen = $location.absUrl().length - $location.url().length;
                const path = newPath.substring(baseLen);
                $location.path(path);
            };
            openConfirmDialog(title, message, onConfirm);
        } else {
            unsubscribeListeners();
        }
    };

    const unsubscribeListeners = () => {
        window.removeEventListener('beforeunload', beforeunloadHandler);
        subscriptions.forEach((subscription) => subscription());
    };

    const beforeunloadHandler = (event) => {
        if ($scope.queryEditorIsDirty) {
            event.returnValue = true;
        }
    };

    const translateTabsViewModel = () => {
        $scope.tabsViewModel = [
            {page: 1, label: $translate.instant('starting.point.label'), type: 'startGraphQuery'},
            {page: 2, label: $translate.instant('graph.expansion'), type: 'expandQuery'},
            {page: 3, label: $translate.instant('node.basics'), type: 'resourceQuery'},
            {page: 4, label: $translate.instant('edge.basics'), type: 'predicateLabelQuery'},
            {page: 5, label: $translate.instant('node.extra'), type: 'resourcePropertiesQuery'}
        ];
    }

    const initView = () => {
        translateTabsViewModel();
        $repositories.getPrefixes(activeRepository)
            .then((prefixes) => initYasgui(prefixes))
            .finally(() => setLoader(false));

        if (configName) {
            $scope.isUpdate = true;
            GraphConfigRestService.getConfig(configName)
                .then(function (graphConfigModel) {
                    $scope.newConfig = graphConfigModel;
                    initForConfig();
                })
                .catch((data) => {
                    toastr.error(getError(data), $translate.instant('created.connector', {name: configName}));
                });
        } else {
            $scope.isUpdate = false;
            initForConfig();
        }

        if ($scope.getActiveRepository()) {
            getNamespaces();
        }
    };

    const repositoryChangedHandler = () => {
        // Switch yasgui to editor mode only if the start mode is query or not on the first  tab. Only in these cases
        // the yasgui is visible.
        if ($scope.newConfig.isStartMode(StartMode.QUERY) || $scope.page > 1) {
            // this should be set to `yasr` in order to switch the buttons for preview and editor
            $scope.viewMode = 'yasr';
            abortQuery().then(switchToYasqe);
        }
    };

    // =========================
    // Event handlers
    // =========================

    const subscriptions = [];
    subscriptions.push(WorkbenchContextService.onSelectedRepositoryIdUpdated(onSelectedRepositoryIdUpdated));
    subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));
    subscriptions.push($scope.$on('$locationChangeStart', locationChangedHandler));
    subscriptions.push($scope.$on('$destroy', unsubscribeListeners));
    subscriptions.push($scope.$watch($scope.getActiveRepositoryObject, repositoryChangedHandler));

    subscriptions.push($rootScope.$on('$translateChangeSuccess', () => {
        translateTabsViewModel();
    }));
    window.addEventListener('beforeunload', beforeunloadHandler);

    // Trigger for showing the editor and moving it to the right position
    $scope.$watch('newConfig.startMode', (value) => {
        if (value === StartMode.QUERY) {
            updateEditor();
        }
    });

    // Trigger for showing the editor and moving it to the right position
    $scope.$watch('page', (value) => {
        if ($scope.newConfig.isStartMode(StartMode.QUERY) || value > 1) {
            $scope.showEditor();
            updateEditor();
        }
    });

    // =========================
    // Initialization
    // =========================

    initView();
}
