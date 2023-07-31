import 'angular/utils/notifications';
import 'angular/utils/local-storage-adapter';
import {YasqeMode} from "../../models/ontotext-yasgui/yasqe-mode";
import {RenderingMode} from "../../models/ontotext-yasgui/rendering-mode";
import {YasguiComponentDirectiveUtil} from "../../core/directives/yasgui-component/yasgui-component-directive.util";
import {GraphsConfig, StartMode} from "../../models/graphs/graphs-config";

angular
    .module('graphdb.framework.graphexplore.controllers.graphviz.config', [
        'graphdb.framework.utils.notifications',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .controller('GraphConfigCtrl', GraphConfigCtrl);

GraphConfigCtrl.$inject = [
    '$scope',
    '$timeout',
    '$location',
    'toastr',
    '$repositories',
    'SparqlRestService',
    '$filter',
    'GraphConfigRestService',
    'AutocompleteRestService',
    '$routeParams',
    'Notifications',
    'RDF4JRepositoriesRestService',
    'LocalStorageAdapter',
    'LSKeys',
    '$translate'
];

function GraphConfigCtrl(
    $scope,
    $timeout,
    $location,
    toastr,
    $repositories,
    SparqlRestService,
    $filter,
    GraphConfigRestService,
    AutocompleteRestService,
    $routeParams,
    Notifications,
    RDF4JRepositoriesRestService,
    LocalStorageAdapter,
    LSKeys,
    $translate
) {

    // =========================
    // Public fields
    // =========================

    $scope.page = 1;
    $scope.totalPages = 5;
    $scope.helpHidden = LocalStorageAdapter.get(LSKeys.HIDE_GRAPH_CONFIG_HELP) === 1;
    $scope.newConfig = new GraphsConfig();
    $scope.newConfig.startQueryIncludeInferred = true;
    $scope.newConfig.startQuerySameAs = true;
    $scope.newConfig.startMode = StartMode.SEARCH;
    $scope.isUpdate = false;
    $scope.shared = false;
    /**
     * Flag showing if the user have permission to write in the currently selected repository.
     * @type {boolean}
     */
    $scope.canEditActiveRepo = $scope.canWriteActiveRepo();
    $scope.samples = [];

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: 'select * where { \n' +
            '\t?s ?p ?o .\n' +
            '} limit 100 \n',
        inference: $scope.newConfig.startQueryIncludeInferred,
        sameAs: $scope.newConfig.startQuerySameAs
    };
    $scope.currentQuery = angular.copy(defaultTabConfig);
    /**
     * @type {Promise|undefined}
     */
    $scope.getAutocompletePromise = undefined;
    /**
     * @type {Promise|undefined}
     */
    $scope.getNamespacesPromise = undefined;

    // =========================
    // TODO: Private fields
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
    // TODO: Public functions
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
     * @param sample
     * @return {boolean}
     */
    $scope.isDefaultGraph = (sample) => {
        return sample.name === 'Minimal' || sample.name === 'Advanced';
    };

    /**
     * A filter used to filter query samples during the rendering.
     * @param sample
     * @return {boolean}
     */
    $scope.isUserGraph = (sample) => {
        return !$scope.isDefaultGraph(sample);
    };

    $scope.getSampleName = (sample, property) => {
        const extra = sample[property + 'Description'];
        if (extra) {
            // Sample has description, use it
            return extra;
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

        $scope.newConfig.startQueryIncludeInferred = $scope.currentQuery.inference;
        $scope.newConfig.startQuerySameAs = $scope.currentQuery.sameAs;

        validateCurrentPage(() => {
            if (!$scope.newConfig.name) {
                showInvalidMsg($translate.instant('graphexplore.provide.config.name'));
                return;
            }
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
    };

    // TODO: used to be called as a handler from the yasgui component and worked in the old yasgui but not implemented here
    $scope.markDirty = (evt) => {
        if ($scope.revertConfig) {
            const q1 = getQueryForCurrentPage($scope.revertConfig);
            const q2 = window.editor.getValue().trim();
            $scope.queryEditorIsDirty = q1 !== q2;
        }
    };

    $scope.showEditor = () => {
        $scope.viewMode = 'yasr';
        // TODO: abort running query if any
        switchToYasqe();
    };

    $scope.showPreview = () => {
        // For some reason YASR gets confused and sets this to rawResponse
        // if we execute a CONSTRUCT and then a SELECT. This makes sure it's always table.
        $scope.viewMode = 'editor';
        $scope.currentQuery.outputType = 'table';
        runQuery();
    };

    $scope.revertEditor = () => {
        $scope.setQuery(getQueryForCurrentPage($scope.revertConfig));
    };

    // =========================
    // TODO: Event handlers
    // =========================

    $scope.$on('$destroy', function () {
        //
    });

    $scope.$on('autocompleteStatus', () => {
        checkAutocompleteStatus();
    });

    // Trigger for showing the editor and moving it to the right position
    $scope.$watch('newConfig.startMode', (value) => {
        if (value === StartMode.QUERY) {
            $timeout(() => {
                updateEditor();
            }, 0);
        }
    });

    // Trigger for showing the editor and moving it to the right position
    $scope.$watch('page', (value) => {
        if ($scope.newConfig.isStartMode(StartMode.QUERY) || value > 1) {
            $timeout(() => {
                $scope.showEditor();
                updateEditor();
            }, 0);
        }
    });

    // =========================
    // TODO: Private functions
    // =========================

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

            // setLoader(true, $translate.instant('evaluating.query.msg'));

            executeYasqeQuery();
            switchToYasr();
        }
    };

    const executeYasqeQuery = async () => {
        const yasguiInstance = await getYasguiInstance();
        yasguiInstance.query();
    }

    const switchToYasqe = async () => {
        const yasguiInstance = await getYasguiInstance()
        yasguiInstance.changeRenderMode(RenderingMode.YASQE);
    }

    const switchToYasr = async () => {
        const yasguiInstance = await getYasguiInstance()
        yasguiInstance.changeRenderMode(RenderingMode.YASR);
    }

    const getNamespaces = () => {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, $translate.instant('common.refreshing.namespaces'), $translate.instant('common.extra.message'));
        RDF4JRepositoriesRestService.getRepositoryNamespaces($repositories.getActiveRepository())
            .success(function (data) {
                const usedPrefixes = {};
                // TODO: move this to a mapper
                data.results.bindings.forEach(function (e) {
                    usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                $scope.namespaces = usedPrefixes;
            })
            .error(function (data) {
                $scope.repositoryError = getError(data);
            })
            .finally(function () {
                // Signals namespaces were fetched => loader will be hidden
                setLoader(false);
            });
    }

    const updateModel = async () => {
        const yasguiInstance = await getYasguiInstance()
        /** @type string */
        let query = await yasguiInstance.getQuery();
        query = query.trim();

        if ($scope.newConfig.isStartMode(StartMode.QUERY) && $scope.page === 1) {
            $scope.newConfig.startGraphQuery = query;
        } else if ($scope.page === 2) {
            $scope.newConfig.expandQuery = query;
        } else if ($scope.page === 3) {
            $scope.newConfig.resourceQuery = query;
        } else if ($scope.page === 4) {
            $scope.newConfig.predicateLabelQuery = query;
        } else if ($scope.page === 5) {
            $scope.newConfig.resourcePropertiesQuery = query;
        }

        return $scope.newConfig;
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
                $scope.samples = data.filter((sample) => {
                    // Skip the currently edited config from samples and store it into a revert variable
                    if (!sample.id || $scope.newConfig.id !== sample.id) {
                        return true;
                    } else {
                        $scope.revertConfig = sample;
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
        $scope.currentQuery.query = getQueryForCurrentPage($scope.newConfig);
        // Check for ontop repository and override nocount property (it's default value is false)
        if ($repositories.isActiveRepoOntopType()) {
            $scope.nocount = true;
        }
        $scope.currentQuery.inference = $scope.newConfig.startQueryIncludeInferred;
        $scope.currentQuery.sameAs = $scope.newConfig.startQuerySameAs;
        $scope.setQuery($scope.currentQuery.query)
    };

    const showInvalidMsg = (message) => {
        toastr.warning(message);
    };

    /**
     * @param {GraphsConfig} config
     */
    const getQueryForCurrentPage = (config) => {
        let query;

        if (config.isStartMode(StartMode.QUERY) && $scope.page === 1) {
            query = config.startGraphQuery;
        } else if ($scope.page === 2) {
            query = config.expandQuery;
        } else if ($scope.page === 3) {
            query = config.resourceQuery;
        } else if ($scope.page === 4) {
            query = config.predicateLabelQuery;
        } else if ($scope.page === 5) {
            query = config.resourcePropertiesQuery;
        }
        return angular.isDefined(query) ? query : '';
    };

    const checkAutocompleteStatus = () => {
        $scope.getAutocompletePromise = AutocompleteRestService.checkAutocompleteStatus();
    }

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
        checkAutocompleteStatus();
        $scope.getNamespacesPromise = RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository());
    }

    const query = 'select * where { \n' +
        '\t?s ?p ?o .\n' +
        '} limit 100 \n'

    const getQueryEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}`;
    };

    const defaultYasguiConfig = {
        endpoint: getQueryEndpoint(),
        showEditorTabs: false,
        showToolbar: false,
        showResultTabs: false,
        showYasqeActionButtons: false,
        yasqeActionButtons: DISABLE_YASQE_BUTTONS_CONFIGURATION,
        showQueryButton: false,
        initialQuery: ' ',
        componentId: 'graphs-config',
        render: RenderingMode.YASQE,
        maxPersistentResponseSize: 0,
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
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            yasrInnerContainer.addClass('hide');
        } else {
            $scope.progressMessage = '';
            $scope.extraMessage = '';
            yasrInnerContainer.removeClass('hide');
        }
        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    };

    const getLoaderMessage = () => {
        const timeSeconds = (Date.now() - $scope.queryStartTime) / 1000;
        const timeHuman = $scope.getHumanReadableSeconds(timeSeconds);
        let message;

        if ($scope.progressMessage) {
            message = $scope.progressMessage + '... ' + timeHuman;
        } else {
            message = $translate.instant('common.running.operation', {timeHuman: timeHuman});
        }
        if ($scope.extraMessage && timeSeconds > 10) {
            message += '\n' + $scope.extraMessage;
        }

        return message;
    };

    const initView = () => {
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

    // =========================
    // TODO: Initialization
    // =========================

    initView();
}
