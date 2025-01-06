import 'angular/core/services';
import 'angular/core/services/workbench-context.service';
import 'angular/core/services/rdf4j-repositories.service';
import D3 from 'lib/common/d3-utils.js';
import d3tip from 'lib/d3-tip/d3-tip-patch';
import * as d3 from 'd3';
import 'angular/utils/local-storage-adapter';
import {NUMBER_PATTERN} from "../../repositories/repository.constants";
import {removeSpecialChars} from "../../utils/string-utils";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";
import {HtmlUtil} from "../../utils/html-util";

const modules = [
    'ui.scroll.jqlite',
    'ui.scroll',
    'toastr',
    'ui.bootstrap',
    'ngTagsInput',
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.core.services.workbench-context',
    'graphdb.framework.core.services.rdf4j.repositories'
];

angular
    .module('graphdb.framework.graphexplore.controllers.graphviz', modules)
    .controller('GraphsVisualizationsCtrl', GraphsVisualizationsCtrl)
    .controller('SaveGraphModalCtrl', SaveGraphModalCtrl)
    .config(['$uibTooltipProvider', function ($uibTooltipProvider) {
        $uibTooltipProvider.options({appendToBody: true});
    }]);

GraphsVisualizationsCtrl.$inject = [
    "$scope",
    "$rootScope",
    "$repositories",
    "$licenseService",
    "toastr",
    "$timeout",
    "ClassInstanceDetailsService",
    "$q",
    "$location",
    "$jwtAuth",
    "UiScrollService",
    "ModalService",
    "$uibModal",
    "$window",
    "LocalStorageAdapter",
    "LSKeys",
    "SavedGraphsRestService",
    "GraphConfigRestService",
    "GraphDataRestService",
    "$translate",
    "GuidesService",
    "WorkbenchContextService",
    'RDF4JRepositoriesService'
];

function GraphsVisualizationsCtrl(
    $scope,
    $rootScope,
    $repositories,
    $licenseService,
    toastr,
    $timeout,
    ClassInstanceDetailsService,
    $q,
    $location,
    $jwtAuth,
    UiScrollService,
    ModalService,
    $uibModal,
    $window,
    LocalStorageAdapter,
    LSKeys,
    SavedGraphsRestService,
    GraphConfigRestService,
    GraphDataRestService,
    $translate,
    GuidesService,
    WorkbenchContextService,
    RDF4JRepositoriesService
) {
    // =========================
    // Public fields
    // =========================

    $scope.languageChanged = false;
    $scope.propertiesObj = {};
    $scope.propertiesObj.items = [];
    $scope.propertiesQueryObj = {};
    $scope.propertiesQueryObj.query = '';
    $scope.propertiesSearchPlaceholder = $translate.instant("visual.search.instance.placeholder");
    $scope.propertiesNotFiltered = [];
    $scope.searchVisible = false;
    $scope.nodeSelected = false;
    $scope.queryResultsMode = false;
    $scope.embedded = $location.search().embedded;
    $scope.openedNodeInfoPanel = undefined;
    $scope.invalidLimit = false;
    $scope.INVALID_LINKS_MSG = $translate.instant('sidepanel.invalid.limit.links.msg');
    $scope.INVALID_LINKS_TOOLTIP = $translate.instant('sidepanel.invalid.limit.links.tooltip');
    $scope.datasource = undefined;
    // adapter implementation for ui-scroll directive
    $scope.adapterContainer = {adapter: {remain: true}};
    // Flag to avoid calling repo init logic twice
    $scope.hasInitedRepository = false;
    $scope.defaultSettings = {
        linksLimit: 20,
        includeInferred: true,
        sameAsState: true,
        languages: ['en'],
        showLinksText: true,
        preferredTypes: [],
        rejectedTypes: [],
        preferredPredicates: [],
        rejectedPredicates: ["http://dbpedia.org/property/logo",
            "http://dbpedia.org/property/hasPhotoCollection",
            "http://dbpedia.org/property/website",
            "http://dbpedia.org/property/homepage",
            "http://dbpedia.org/ontology/thumbnail",
            "http://xmlns.com/foaf/0.1/depiction",
            "http://xmlns.com/foaf/0.1/homepage",
            "http://xmlns.com/foaf/0.1/mbox",
            "http://dbpedia.org/ontology/wikiPage*",
            "http://dbpedia.org/property/wikiPage*",
            "http://factforge.net/*"],
        preferredTypesOnly: false,
        preferredPredicatesOnly: false,
        includeSchema: true
    };
    // Static defaults before we do the actual dynamic default settings in initSettings
    $scope.saveSettings = _.cloneDeep($scope.defaultSettings);
    $scope.defaultGraphConfig = {
        id: 'default',
        name: 'Easy graph',
        startMode: 'search'
    };

    // TODO: check if this can be moved in the local scope and not in  the global one
    $rootScope.key = "";


    // =========================
    // Public functions
    // =========================

    // Handle pageslide directive callbacks which incidentally appeared to be present in the angular's
    // scope, so we need to define our's and pass them to pageslide, otherwise it throws an error.
    $scope.onopen = $scope.onclose = () => angular.noop();

    $scope.goToHome = () => {
        resetState();
        $location.url("graphs-visualizations");
    };

    $scope.shouldShowSettings = () => {
        return $scope.configLoaded && $scope.configLoaded.id === $scope.defaultGraphConfig.id;
    };

    $scope.shouldDisableSameAs = () => {
        const sameAsCheckbox = $('#sameAsCheck');
        if ($scope.settings && !$scope.settings['includeInferred'] && sameAsCheckbox.prop('checked')) {
            sameAsCheckbox.prop("checked", false);
            $scope.settings['sameAsState'] = false;
        }

        return $scope.settings && !$scope.settings['includeInferred'];
    };

    $scope.propertiesFilterFunc = (item) => {
        return item.key.toLowerCase().indexOf($scope.propertiesQueryObj.query.toLowerCase()) >= 0;
    };

    $scope.toggleMoreInfo = (ev) => {
        angular.element(ev.currentTarget).parent().next().toggle(200);
        angular.element(ev.currentTarget).children('span').toggleClass("icon-caret-down").toggleClass("icon-caret-up");
    };

    $scope.copyToClipboard = (uri) => {
        ModalService.openCopyToClipboardModal(uri);
    };

    $scope.resetSettings = () => {
        $scope.settings = _.cloneDeep($scope.defaultSettings);
        $scope.validateLinksLimit();
        renderSettings();
    };

    $scope.changeLimit = (delta) => {
        let linksLimit = $scope.settings.linksLimit + delta;
        if (linksLimit < 1) {
            linksLimit = 1;
        }
        if (linksLimit > 1000) {
            linksLimit = 1000;
        }
        $scope.settings.linksLimit = linksLimit;
    };

    $scope.validateLinksLimit = () => {
        $scope.invalidLimit = !NUMBER_PATTERN.test($scope.settings.linksLimit);
    };

    $scope.showSettings = () => {
        $scope.showInfoPanel = true;
        $scope.showFilter = true;
        $scope.showNodeInfo = false;
        $scope.showPredicates = false;
        if (!$scope.saveSettings) {
            $scope.settings = _.cloneDeep($scope.defaultSettings);
        } else {
            $scope.settings = _.cloneDeep($scope.saveSettings);
        }
        renderSettings();
    };

    $scope.updateSettings = () => {
        if ($scope.invalidLimit) {
            toastr.error($scope.INVALID_LINKS_TOOLTIP, $scope.INVALID_LINKS_MSG);
            return;
        }
        $scope.saveSettings = $scope.settings;
        $scope.saveSettings.languages = _.map($scope.saveSettings['languagesMap'], function (s) {
            return s['text'];
        });

        $scope.saveSettings.preferredTypes = _.map($scope.saveSettings['preferredTypesMap'], function (t) {
            return t['text'];
        });
        $scope.saveSettings.rejectedTypes = _.map($scope.saveSettings['rejectedTypesMap'], function (t) {
            return t['text'];
        });

        $scope.saveSettings.preferredPredicates = _.map($scope.saveSettings['preferredPredicatesMap'], function (t) {
            return t['text'];
        });
        $scope.saveSettings.rejectedPredicates = _.map($scope.saveSettings['rejectedPredicatesMap'], function (t) {
            return t['text'];
        });

        // TODO
        // reexpand root node
        if ($scope.rootNodeIri) {
            reExpandNode($scope.rootNodeIri);
        } else if ($scope.queryResultsMode && $location.search().query) {
            loadGraphForQuery($location.search().query,
                $location.search().sameAs,
                $location.search().inference);
        } else if ($scope.configLoaded.startMode === 'query') {
            loadGraphConfig($scope.configLoaded);
        }

        updatePredicateLabels();

        $scope.showInfoPanel = false;
        $scope.showFilter = false;

        LocalStorageAdapter.set(LSKeys.GRAPHS_VIZ, $scope.saveSettings);
    };

    // Graph Config
    $scope.getGraphConfigs = (graphCallback) => {
        GraphConfigRestService.getGraphConfigs()
            .success(function (data) {
                $scope.graphConfigs = data;
                if (graphCallback) {
                    graphCallback();
                }
            }).error(function (data) {
            toastr.error(getError(data), $translate.instant('graphexplore.error.graph.configs.short.msg'));
        });
    };

    $scope.findConfigById = function (configId) {
        if (configId === $scope.defaultGraphConfig.id) {
            return $scope.defaultGraphConfig;
        }
        return $.grep($scope.graphConfigs, function (e) {
            return e.id === configId;
        })[0];
    };

    $scope.easyGraphSearch = (iri) => {
        $scope.configLoaded = $scope.defaultGraphConfig;
        $scope.openUri(iri);
    };

    /**
     * Handles the delete graph config action.
     * @param {GraphsConfig} config
     */
    $scope.deleteConfig = (config) => {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: $translate.instant('graphexplore.delete.graph', {configName: config.name}),
            warning: true
        }).result
            .then(function () {
                GraphConfigRestService.deleteGraphConfig(config)
                    .success(function () {
                        $scope.getGraphConfigs();
                        $scope.refreshSavedGraphs();
                    }).error(function (data) {
                    toastr.error(getError(data), $translate.instant('graphexplore.error.cannot.delete.config'));
                });
            });
    };

    $scope.goToGraphConfig = (config) => {
        pushHistory({config: config.id}, {config: config});
        resetState();
        loadGraphConfig(config);
    };

    $scope.replaceIRIWithPrefix = (iri) => {
        const namespaces = $scope.namespaces;
        const namespacePrefix = _.findLast(namespaces, function (o) {
            return iri.indexOf(o.uri) === 0;
        });
        return namespacePrefix ? (namespacePrefix.prefix + ":" + iri.substring(namespacePrefix.uri.length)) : iri;
    };

    const onSelectedRepositoryIdUpdated = (repositoryId) => {
        if (!repositoryId) {
            $scope.repositoryNamespaces = new NamespacesListModel();
            return;
        }
        RDF4JRepositoriesService.getNamespaces(repositoryId)
            .then((repositoryNamespaces) => {
                $scope.repositoryNamespaces = repositoryNamespaces;
                $scope.namespaces = repositoryNamespaces.namespaces;
            })
            .catch((error) => {
                const msg = getError(error);
                toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
            });
    };

    const onAutocompleteEnabledUpdated = (autocompleteEnabled) => {
        $scope.isAutocompleteEnabled = autocompleteEnabled;
    };

    // =========================
    // Event handlers
    // =========================

    const subscriptions = [];

    subscriptions.push($rootScope.$on('$translateChangeSuccess', function () {
        $scope.INVALID_LINKS_MSG = $translate.instant('sidepanel.invalid.limit.links.msg');
        $scope.INVALID_LINKS_TOOLTIP = $translate.instant('sidepanel.invalid.limit.links.tooltip');
        $scope.propertiesSearchPlaceholder = $translate.instant("visual.search.instance.placeholder");
    }));

    subscriptions.push(WorkbenchContextService.onAutocompleteEnabledUpdated(onAutocompleteEnabledUpdated));
    subscriptions.push(WorkbenchContextService.onSelectedRepositoryIdUpdated(onSelectedRepositoryIdUpdated));

    subscriptions.push($scope.$on('repositoryIsSet', function (event, args) {
        // New repo set from dropdown, clear init state
        if (args.newRepo) {
            $scope.hasInitedRepository = false;
        }

        initForRepository(args.newRepo);

        // New repo set from dropdown, clear state and go to home page
        if (args.newRepo) {
            resetState();
            // Quick-n-dirty way to get rid of the existing vis
            $('.graph-visualization svg').empty();

            // When we come from the sparql view and then change the repo though the dropdown,
            // should goToHome and reinit the view, for the search to view on the home page
            if ($location.search().query) {
                $scope.goToHome();
                initGraphFromQueryParam();
            }

        }
    }));

    const rootScopeGenericWatcher = () => $rootScope.key;
    const rootScopeGenericChangeHandler = () => {
        position = 0;
        _.each($scope.propertiesObj.items, function (item) {
            if ($rootScope.key > item) {
                position++;
            }
        });
        current++;
    };
    subscriptions.push($rootScope.$watch(rootScopeGenericWatcher, rootScopeGenericChangeHandler));

    const propertiesItemsChangeHandler = () => {
        if (angular.isDefined($scope.propertiesObj.items) && $scope.propertiesObj.items.length > 0) {
            $timeout(function () {
                $scope.adapterContainer.adapter.reload();
            }, 500);
        }
    };
    subscriptions.push($scope.$watch('propertiesObj.items', propertiesItemsChangeHandler));

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    const destroyHandler = () => {
        removeAllListeners();
        window.onpopstate = null;
    };

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', destroyHandler);

    // =========================
    // Private functions
    // =========================

    const init = () => {
        // TODO: move all initialization logic here
    };

    const pushHistory = (searchParams, state) => {
        if ($scope.embedded) {
            searchParams.embedded = true;
        }
        state.skipOnPopState = true;
        $location.search(searchParams);
        $location.state(state);
    };

    const resetState = () => {
        $scope.searchVisible = false;
        $scope.nodeSelected = false;
        $scope.configLoaded = null;
        $scope.queryResultsMode = false;
        $scope.lastSavedGraphName = null;
        $scope.lastSavedGraphId = null;
        $scope.shared = false;
        $scope.numberOfPinnedNodes = 0;

        // Reset type colours
        type2color = {};
        colorIndex = 0;
    };

    const getSettings = () => {
        // When a guide is active we really want the default settings to make sure the user gets
        // the same as the author of the guide intended
        return GuidesService.isActive() ? $scope.defaultSettings : $scope.saveSettings;
    };

    const updatePredicateLabels = () => {
        if (!getSettings()['showLinksText']) {
            d3.selectAll("svg .link-wrapper text")
                .style("display", "none");
        } else {
            d3.selectAll("svg .link-wrapper text")
                .style("display", "block");
        }
    };

    const updateNodeLabels = (nodeLabels) => {
        nodeLabels.each(function (d) {
            d.fontSize = D3.Text.calcFontSizeRaw(d.labels[0].label, d.size, nodeLabelMinFontSize, true);
            // TODO: get language and set it on the label html tag
        })
            .attr("height", function (d) {
                return d.fontSize * 3;
            })
            // if this was kosher we would use xhtml:body here but if we do that angular (or the browser)
            // goes crazy and resizes/messes up other unrelated elements. div seems to work too.
            .append("xhtml:div")
            .attr("class", "node-label-body")
            .style("font-size", function (d) {
                return d.fontSize + 'px';
            })
            .append('xhtml:div')
            .html(function (d) {
                return HtmlUtil.getText(d.labels[0].label).replaceAll("\n", "<br>");
            });
    };

    const initSettings = (principal) => {
        const settingsFromPrincipal = principal.appSettings;

        // New style settings from principal
        $scope.defaultSettings.includeInferred = settingsFromPrincipal['DEFAULT_INFERENCE'];
        $scope.defaultSettings.sameAsState = settingsFromPrincipal['DEFAULT_INFERENCE'] && settingsFromPrincipal['DEFAULT_SAMEAS'];
        $scope.defaultSettings.includeSchema = settingsFromPrincipal['DEFAULT_VIS_GRAPH_SCHEMA'];

        const localStorageSettings = LocalStorageAdapter.get(LSKeys.GRAPHS_VIZ);
        if (localStorageSettings && typeof localStorageSettings === 'object') {
            // Patch existing settings
            try {
                $scope.saveSettings = localStorageSettings;
                if ($scope.saveSettings['includeSchema'] === undefined) {
                    // Add the new defaults when migrating from an old GDB
                    $scope.saveSettings['includeSchema'] = $scope.defaultSettings['includeSchema'];
                    $scope.saveSettings['rejectedPredicates'] = [...$scope.saveSettings['rejectedPredicates'], ...$scope.defaultSettings['rejectedPredicates']].unique();
                }
            } catch (e) {
                $scope.saveSettings = _.cloneDeep($scope.defaultSettings);
                LocalStorageAdapter.set(LSKeys.GRAPHS_VIZ, $scope.saveSettings);
            }
        } else {
            $scope.saveSettings = _.cloneDeep($scope.defaultSettings);
        }
    };

    const renderSettings = () => {
        $scope.settings.languagesMap = _.map($scope.settings.languages, function (v) {
            return {'text': v};
        });

        $scope.settings.preferredTypesMap = _.map($scope.settings.preferredTypes, function (v) {
            return {'text': v};
        });

        $scope.settings.rejectedTypesMap = _.map($scope.settings.rejectedTypes, function (v) {
            return {'text': v};
        });

        $scope.settings.preferredPredicatesMap = _.map($scope.settings.preferredPredicates, function (v) {
            return {'text': v};
        });

        $scope.settings.rejectedPredicatesMap = _.map($scope.settings.rejectedPredicates, function (v) {
            return {'text': v};
        });
    };

    const reExpandNode = () => {
        if ($scope.rootNodeIri) {
            $scope.$broadcast("onRootNodeChange", $scope.rootNodeIri);
        }
    };

    const initGraphFromQueryParam = () => {
        // view sparql
        if ($location.search().query) {
            $scope.searchVisible = false;
            $scope.queryResultsMode = true;
            loadGraphForQuery($location.search().query,
                $location.search().sameAs,
                $location.search().inference);
        } else {
            // broadcasted event from view resource directive to take input value
            $scope.$on('onRootNodeChange', function (e, inputValue) {
                $scope.loading = true;
                const settings = getSettings();
                if (angular.isDefined(inputValue)) {
                    $scope.rootNodeIri = inputValue;
                    GraphDataRestService.getInstanceNode({
                        iri: inputValue,
                        config: $scope.configLoaded ? $scope.configLoaded.id : $scope.defaultGraphConfig.id,
                        languages: !$scope.shouldShowSettings() ? [] : settings['languages'],
                        includeInferred: settings['includeInferred'],
                        sameAsState: settings['sameAsState']
                    }).then(function (response) {
                        $scope.nodeSelected = true;
                        $scope.searchVisible = false;
                        if (response.data.types === null) {
                            response.data.types = "greyColor";
                        }
                        graph = new Graph();
                        const rootNode = graph.addNode(response.data, width / 2, height / 2);

                        transformValues = INITIAL_CONTAINER_TRANSFORM;

                        expandNode(rootNode, true);
                    }).catch(function (err) {
                        $scope.loading = false;
                        toastr.error(getError(err), $translate.instant('graphexplore.error.could.not.load.graph'));
                    });
                }
            });
        }

        if ($location.search().uri) {
            $scope.openUri($location.search().uri, true);
        }

        if ($location.search().saved) {
            SavedGraphsRestService.getSavedGraph($location.search().saved)
                .success(function (data) {
                    $scope.loadSavedGraph(data);
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('graphexplore.error.could.not.open'));
                });
        }
    };

    const loadGraphForQuery = (queryString, sameAsParam, inferredParam) => {
        const settings = getSettings();
        const sendSameAs = (sameAsParam === undefined) ? (settings['sameAsState']) : sameAsParam === true;
        const sendInferred = (inferredParam === undefined) ? (settings['includeInferred']) : inferredParam === true;
        $scope.loading = true;
        GraphDataRestService.updateGraph({
            query: queryString,
            linksLimit: settings['linksLimit'],
            languages: !$scope.shouldShowSettings() ? [] : settings['languages'],
            includeInferred: sendInferred,
            sameAsState: sendSameAs
        }).then(function (response) {
            // Node draw will turn off loader
            initGraphFromResponse(response);
        }, function (response) {
            $scope.loading = false;
            toastr.error(getError(response.data), $translate.instant('graphexplore.error.cannot.load.graph'));
        });
    };

    /**
     * Converts triple to link id or generates unique id (needed for arrows)
     * @param {string} triple
     * @param {boolean} tripleLike
     * @return {string}
     */
    const convertTripleToLinkId = (triple, tripleLike) => {
        const tripleParts = triple.split(' ');
        if (tripleLike) {
            return [tripleParts[0], tripleParts[1], tripleParts[2]].join('>');
        }
        return [tripleParts[0], tripleParts[2]].join('>');
    };

    const convertLinkDataToLinkId = (link) => {
        return [link.source.iri, link.target.iri].join('>');
    };

    /**
     *  If source or target of a link is a triple returns a x
     *  for the link, otherwise returns this of the node.
     *  Because tick is called before links are created we return node's x,
     *  which afterwards will be overridden
     * @param {object} node
     * @return {number|number|*}
     */
    const getNodeX = (node) => {
        if (node.isTriple) {
            const el = document.getElementById(removeSpecialChars(convertTripleToLinkId(node.iri)));
            if (el && typeof el.__data__.x !== "undefined") {
                return el.__data__.x;
            }
        }
        return node.x;
    };

    /**
     *  If source or target of a link is a triple returns a y
     *  for the link, otherwise returns this of the node.
     *  Because tick is called before links are created we return node's y,
     *  which afterwards will be overridden
     * @param {object} node
     * @return {number|number|*}
     */
    const getNodeY = (node) => {
        if (node.isTriple) {
            const el = document.getElementById(removeSpecialChars(convertTripleToLinkId(node.iri)));
            if (el && typeof el.__data__.y !== "undefined") {
                return el.__data__.y;
            }
        }
        return node.y;
    };

    const createTriple = (value) => {
        const tripleParts = value.trim().split(' ');
        return `<<<${tripleParts[0]}> <${tripleParts[1]}> <${tripleParts[2]}>>>`;
    };

    /**
     * Creates unique arrow-marker id will allow change color and refX for particular one
     * @param {object} d
     * @return {string}
     */
    const createArrowMarkerUniqueID = (d) => {
        const source = d.source.isTriple ? convertTripleToLinkId(d.source.iri, true) : d.source.iri;
        const target = d.target.isTriple ? convertTripleToLinkId(d.target.iri, true) : d.target.iri;
        return removeSpecialChars(`${source}>${target}>marker`);
    };

    /**
     * Filters nodes array on a given field
     * @param {string} iri
     * @param {Array} array
     * @return {*}
     */
    const distinctBy = (iri, array) => {
        const keys = array.map((value) => value[iri]);
        return array.filter((value, index) => keys.indexOf(value[iri]) === index);
    };

    const loadConfigForId = (configId, successCallback) => {
        if (configId === $scope.defaultGraphConfig.id) {
            loadGraphConfig($scope.defaultGraphConfig);
        } else {
            GraphConfigRestService.getConfig(configId)
                .then((data) => {
                    loadGraphConfig(data);
                    successCallback();
                })
                .catch((data) => {
                    toastr.error(getError(data), $translate.instant('graphexplore.error.could.not.load.config', {configId: configId}));
                });
        }
    };

    const loadGraphConfig = (config) => {
        $scope.configLoaded = config;
        if (config.startMode === 'search') {
            $scope.searchVisible = true;
        } else if (config.startMode === 'node' && config.startIRI) {
            $timeout(function () {
                $scope.openUri(config.startIRI, true);
            }, 0);
        } else if (config.startMode === 'query' && config.startGraphQuery) {
            $scope.loading = true;
            GraphConfigRestService.loadGraphForConfig(config, config.startQueryIncludeInferred, getSettings()['linksLimit'], config.startQuerySameAs)
                .then(function (response) {
                    // Node drawing will turn off loader
                    initGraphFromResponse(response);
                }, function (data) {
                    $scope.loading = false;
                    toastr.error(getError(data), $translate.instant('graphexplore.error.graph.load'));
                });
        }
    };

    const loadGraphFromQueryParam = function () {
        // view graph config
        if ($location.search().config) {
            loadConfigForId($location.search().config, initGraphFromQueryParam);
        } else if ($location.search().query || $location.search().uri) {
            loadGraphConfig($scope.defaultGraphConfig);
            initGraphFromQueryParam();
        } else {
            initGraphFromQueryParam();
        }
    };

    // Global
    $window.onpopstate = function (event) {
        // Single spa triggers this event in some unwanted cases, for example, when displaying the Visual graph view.
        // By adding skipOnPopState we can skip the execution, whenever we don't need it
        if (event.state && event.state.skipOnPopState) {
          return;
        }

        resetState();

        if (event.state) {
            if (event.state.config) {
                loadGraphConfig(event.state.config);
                if (event.state.uri) {
                    $scope.openUri(event.state.uri, true);
                }
            } else if (event.state.savedGraph) {
                $scope.loadSavedGraph(event.state.savedGraph, true);
            }
        }
    };

    // embedded and other params when the controller is initialized
    if ($scope.embedded && ($location.search().query ||
        $location.search().uri ||
        $location.search().config ||
        $location.search().saved)) {

        $scope.noGoHome = true;
    }

    let position = 0;
    let current = 0;
    let type2color = {};
    let colorIndex = 0;
    const nodeLabelMinFontSize = 16; // in pixels
    // define zoom and drag behavior; keep this out of draw() to preserve state when nodes are added/removed
    const zoomLayout = d3.zoom().scaleExtent([0.1, 10]);
    let container;
    const INITIAL_CONTAINER_TRANSFORM = d3.zoomIdentity.translate(0, -70).scale(1);

    function zoomed(event) {
        if (GuidesService.isActive()) {
            // disable zooming if a guide is active.
            return;
        }
        transformValues = event.transform;
        container.attr("transform", transformValues);
    }

    zoomLayout.on("zoom", zoomed);

    let transformValues = INITIAL_CONTAINER_TRANSFORM;
    // build svg element
    const width = 1000;
    const height = 1000;
    let tipElement;
    let openedLink;

    // creating datasource for class properties data
    $scope.datasource = {
        get: function (index, count, success) {
            return UiScrollService.initLazyList(index, count, success, position, $scope.propertiesObj.items);
        },
        revision: function () {
            return current;
        }
    };

    // Using $q.when to proper set values in view
    $q.when($jwtAuth.getPrincipal()).then((principal) => initSettings(principal));

    $scope.showInfoPanel = false;

    function Graph() {
        this.nodes = [];
        this.links = [];
        this.tripleNodes = new Map();
        this.tripleLinksCopy = new Map();

        this.addNode = function (node, x, y) {
            node.x = x;
            node.y = y;
            this.nodes.push(node);
            return node;
        };

        // computes a "connectedness" metric on each link, which is then used to hint for longer links.
        // this results in improved clustering and appearance.
        this.computeConnectedness = function () {
            // count the the number of times a given node is connected to other nodes
            // (only for nodes connected to more than one node)
            const counts = {};
            const seenLinks = {};
            _.each(this.links, function (link) {
                const i1 = link.source.iri;
                const i2 = link.target.iri;
                const seenKey = _.min([i1, i2]) + "|" + _.max([i1, i2]);
                if (!seenLinks[seenKey]) {
                    seenLinks[seenKey] = 1;
                    counts[i1] = (counts[i1] || 0) + 1;
                    counts[i2] = (counts[i2] || 0) + 1;
                }
            });

            // computes the connectedness of each link based on the number of times its nodes were connected
            // (only for links to/from nodes connected to more than one node)
            _.each(this.links, function (link) {
                if (counts[link.source.iri] > 1 && counts[link.target.iri] > 1) {
                    link.connectedness = Math.min(5, Math.max(counts[link.source.iri], counts[link.target.iri]) - 1);
                } else {
                    link.connectedness = 0;
                }
            });
        };

        this.addAndMatchLinks = function (newLinks) {
            const nodes = this.nodes;
            Array.prototype.push.apply(this.links, matchLinksToNodes(newLinks, nodes));
            for (let key of graph.tripleLinksCopy.keys()) {
                if (graph.tripleLinksCopy.get(key).length === 1) {
                    graph.tripleLinksCopy.delete(key);
                }
            }
            this.links = this.links.filter(link => link !== null);
            this.computeConnectedness();
        };

        const countLinks = function (d, links) {
            return findLinksForNode(d, links).length;
        };

        this.countLinks = countLinks;

        function findLinksForNode(d, links) {
            return _.filter(links, function (l) {
                return l.source.iri === d.iri || l.target.iri === d.iri;
            });
        }

        function linksTypes(d, links) {
            const linksForNode = findLinksForNode(d, links);
            const types = _.map(linksForNode, function (l) {
                return (l.source.iri === d.iri) ? l.target.types : l.source.types;
            });
            return _.uniq(_.flatten(types));
        }

        function linksPredicates(d, links) {
            const linksForNode = findLinksForNode(d, links);
            const predicates = _.map(linksForNode, function (l) {
                return l.predicates;
            });
            return _.uniq(_.flatten(predicates));
        }

        this.linksTypes = linksTypes;

        this.linksPredicates = linksPredicates;

        /**
         *  Removes generated triple links and related nodes
         * @param triplesToRemove
         */
        this.removeTriples = function (triplesToRemove) {
            let targetTriples = [];
            if (this.tripleNodes.size > 0) {
                triplesToRemove.forEach((source) => {
                    if (this.tripleNodes.has(source)) {
                        this.tripleNodes.delete(source);
                        this.links = _.reject(this.links, function (l) {
                            let sourceSplit = source.split('>');
                            let lSource = convertTripleToLinkId(l.source.iri);
                            let lTarget = convertTripleToLinkId(l.target.iri);
                            // Handle triple targets
                            if (lSource === source && graph.tripleNodes.delete(lTarget)) {
                                let targetSplit = lTarget.split('>');
                                targetTriples.push({
                                    source: targetSplit[0],
                                    target: targetSplit[1]
                                });
                            }
                            let isRejected = lSource === source || lTarget === source || (l.source.iri === sourceSplit[0] && l.target.iri === sourceSplit[1]);
                            if (isRejected) {
                                graph.tripleLinksCopy.delete(`${lSource}>${lTarget}`);
                                graph.tripleLinksCopy.delete(`${lTarget}>${lSource}`);
                            }
                            return isRejected;
                        });
                    }
                });
            }

            // This step is needed for removing artificially created links representing triples
            targetTriples.forEach((target) => {
                this.links = _.reject(this.links, function (l) {
                    return l.source.iri === target.source && l.target.iri === target.target;
                });
            });
        }

        this.removeNode = function (d) {
            let triplesToRemove = [];
            this.links = _.reject(this.links, function (l) {
                let isRejected = l.source.iri === d.iri || l.target.iri === d.iri;
                if (isRejected) {
                    if (l.target.isTriple) {
                        triplesToRemove.push(convertTripleToLinkId(l.target.iri));
                    }
                    if (!l.source.isTriple && !l.target.isTriple) {
                        triplesToRemove.push([l.source.iri, l.target.iri].join('>'))
                    }
                }
                return isRejected;
            });

            this.removeTriples(triplesToRemove);

            const links = this.links;
            this.nodes = _.reject(this.nodes, function (n) {
                return countLinks(n, links) === 0;
            });
            if (this.nodes.length === 0) {
                $scope.nodeSelected = false;
            }

            this.computeConnectedness();
        };

        this.removeNodeLeafLinks = function (d) {
            let triplesToRemove = [];
            let links = this.links;
            this.links = _.reject(this.links, function (l) {
                let isRejected = (l.source.iri === d.iri && countLinks(l.target, links) === 1 && !l.target.isTriple) ||
                    (l.target.iri === d.iri && countLinks(l.source, links) === 1 && !l.source.isTriple);
                if (!isRejected) {
                    let targetLinks;
                    if (l.source.iri === d.iri && countLinks(l.target, links) === 2 && !l.target.isTriple) {
                        targetLinks = findLinksForNode(l.target, links);
                    } else if (l.target.iri === d.iri && countLinks(l.source, links) === 2 && !l.source.isTriple) {
                        targetLinks = findLinksForNode(l.source, links);
                    }
                    if (!targetLinks) {
                        return false;
                    }
                    // the node to which (or from which) d has link to has only two links, check if the second one is to d also
                    isRejected = (targetLinks[0].source.iri === d.iri || targetLinks[0].target.iri) &&
                        (targetLinks[1].source.iri === d.iri || targetLinks[1].target.iri);
                }
                if (isRejected) {
                    if (l.target.isTriple) {
                        triplesToRemove.push(convertTripleToLinkId(l.target.iri));
                    }
                    if (!l.source.isTriple && !l.target.isTriple) {
                        triplesToRemove.push([l.source.iri, l.target.iri].join('>'))
                    }
                }
                return isRejected;
            });

            this.removeTriples(triplesToRemove);

            links = this.links;
            this.nodes = _.reject(this.nodes, function (n) {
                return countLinks(n, links) === 0 && n.iri !== d.iri;
            });

            this.computeConnectedness();
        };

        this.addTriple = function (triple, x, y) {
            triple.x = x;
            triple.y = y;
            triple.weight = 0;
            let key = convertTripleToLinkId(triple.iri);
            if (!this.tripleNodes.has(key)) {
                triple.weight = 10;
                this.tripleNodes.set(key, [triple]);
            } else {
                let value = this.tripleNodes.get(key);
                value.push(triple);
                this.tripleNodes.set(key, value);
            }
        }

        function matchLinksToNodes(newLinks, nodes) {
            return _.map(newLinks, function (link) {
                let source;
                let target;
                if (link.isTripleSource) {
                    source = getTripleNode(link.source);
                } else {
                    source = _.find(nodes, function (o) {
                        return o.iri === link.source;
                    })
                }
                if (link.isTripleTarget) {
                    target = getTripleNode(link.target);
                } else {
                    target = _.find(nodes, function (o) {
                        return o.iri === link.target;
                    })
                }
                let matchedLink = {
                    "source": source,
                    "target": target,
                    "predicates": link.predicates
                };
                // make copy of links with triples in them
                if (link.isTripleSource || link.isTripleTarget) {
                    let sourceId = matchedLink.source.isTriple ? convertTripleToLinkId(matchedLink.source.iri) : matchedLink.source.iri;
                    let targetId = matchedLink.target.isTriple ? convertTripleToLinkId(matchedLink.target.iri) : matchedLink.target.iri;
                    let linkId = `${sourceId}>${targetId}`;
                    if (graph.tripleLinksCopy.has(linkId)) {
                        let value = graph.tripleLinksCopy.get(linkId);
                        value[0].predicates.push(...matchedLink.predicates);
                        value.push(matchedLink);
                        graph.tripleLinksCopy.set(linkId, value);
                        return null;
                    } else {
                        graph.tripleLinksCopy.set(linkId, [matchedLink]);
                    }
                }
                return matchedLink;
            });
        }

        this.copyState = function () {
            const nodesCopy = _.map(this.nodes, function (node) {
                return {
                    iri: node.iri,
                    isTriple: node.isTriple,
                    size: node.size,
                    labels: _.cloneDeep(node.labels),
                    types: _.cloneDeep(node.types),
                    rdfRank: node.rdfRank,
                    x: node.x,
                    y: node.y,
                    fixed: node.fixed
                };
            });

            const triplesCopy = JSON.stringify(Array.from(this.tripleNodes.entries()));
            const tripleLinksCopy = JSON.stringify(Array.from(this.tripleLinksCopy.entries()));

            const linksCopy = _.map(this.links, function (link) {
                return {
                    source: link.source.iri,
                    isTripleSource: link.source.isTriple,
                    target: link.target.iri,
                    isTripleTarget: link.target.isTriple,
                    predicates: link.predicates
                };
            });

            return {
                nodes: nodesCopy,
                links: linksCopy,
                tripleNodes: triplesCopy,
                tripleLinksCopy: tripleLinksCopy,
                colorIndex: colorIndex,
                type2color: type2color,
                transform: transformValues
            };
        };

        this.restoreState = function (state) {
            $scope.nodeSelected = true;
            $scope.searchVisible = false;

            this.nodes = _.cloneDeep(state.nodes);
            // check if triples exists is needed for old configs
            this.tripleNodes = state.tripleNodes ? new Map(JSON.parse(state.tripleNodes)) : new Map();
            this.links = [];
            this.addAndMatchLinks(state.links);
            this.tripleLinksCopy = state.tripleLinksCopy ? new Map(JSON.parse(state.tripleLinksCopy)) : new Map();

            _.each(this.nodes, function (d) {
                if (d.fixed) {
                    $scope.numberOfPinnedNodes++;
                }
            });

            if (angular.isDefined(state.colorIndex) && angular.isDefined(state.type2color)) {
                colorIndex = state.colorIndex;
                type2color = _.cloneDeep(state.type2color);
            }

            if (angular.isDefined(state.transform)) {
                transformValues = d3.zoomIdentity.translate(state.transform.x, state.transform.y).scale(state.transform.k)
            }

            draw();
        };
    }

    let graph = new Graph();

    function expandPrefix(str, namespaces) {
        const ABS_URI_REGEX = /^<?(http|urn).*>?/;
        if (!ABS_URI_REGEX.test(str)) {
            const uriParts = str.split(':');
            const uriPart = uriParts[0];
            const localName = uriParts[1];
            if (!angular.isUndefined(localName)) {
                const expandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(namespaces, uriPart);
                if (expandedUri) {
                    return expandedUri + localName;
                }
            }
        }
        return str;
    }

    $scope.addedTag = function (tag) {
        if (tag.text.indexOf(':') < 0) {
            toastr.warning($translate.instant('graphexplore.absolute.prefixed.iri'));
            return null;
        }
        tag.text = expandPrefix(tag.text, $scope.namespaces);
        $scope.pageslideExpanded = true;
        return tag;
    };

    $scope.validateTag = function (tag, category, wildcardOK) {
        if (tag.text.indexOf(':') < 0) {
            if (wildcardOK) {
                toastr.warning($translate.instant('graphexplore.absolute.prefixed.iri.option'), category);
            } else {
                toastr.warning($translate.instant('graphexplore.absolute.prefixed.iri'), category);
            }
            return false;
        }
        const wildcardPos = tag.text.indexOf('*');
        if (wildcardPos >= 0) {
            if (!wildcardOK) {
                toastr.warning($translate.instant('graphexplore.wildcards.not.allowed'), category);
                return false;
            } else if (wildcardPos < tag.text.length - 1) {
                toastr.warning($translate.instant('graphexplore.wildcards.last.char'), category);
                return false;
            }
        }
        return true;
    };

    $scope.getTagClass = function (tagText) {
        if (tagText.endsWith('*')) {
            return 'tag-item-wildcard';
        }
        return null;
    };

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.isLicenseValid = function () {
        return $licenseService.isLicenseValid();
    };

    // This method may be called twice - once by us explicitly and once by the repositoryInit event.
    // In some race conditions getActiveRepository() will be already set when we enter it the first
    // time but then we'll be called again by the event, so we need the above flag to avoid double
    // initialization and weirdness.
    function initForRepository(newRepo) {
        if (!$repositories.getActiveRepository() || $scope.hasInitedRepository && !newRepo) {
            return;
        }

        $scope.hasInitedRepository = true;

        if (!newRepo) {
            // Process params only if this isn't a repo that was just selected from the dropdown menu
            $scope.getGraphConfigs(loadGraphFromQueryParam);
        }
    }

    initForRepository();

    const multiClickDelay = 500; // max delay between clicks for multiple click events

    const nodeLabelRectScaleX = 1.75;

    const color1 = d3.scaleLinear()
        .domain([0, 9])
        .range(["hsl(0, 100%, 75%)", "hsl(360, 90%, 82%)"])
        .interpolate(d3.interpolateHslLong);

    const color2 = d3.scaleLinear()
        .domain([0, 9])
        .range(["hsl(180, 50%, 75%)", "hsl(540, 40%, 82%)"])
        .interpolate(d3.interpolateHslLong);

    $scope.getColor = function (type) {
        if (angular.isUndefined(type2color[type])) {
            type2color[type] = colorIndex;
            colorIndex++;
        }

        const index = type2color[type];
        if (index > 39) {
            return "#c2c2c2";
        } else if (index % 2 === 0) {
            return color1(index / 2);
        } else {
            return color2(index / 2);
        }
    };

    const forceX = d3.forceX(width / 2).strength(0.005)
    const forceY = d3.forceY(height / 2).strength(0.005)

    const force = d3.forceSimulation()
        .force('x', forceX)
        .force('y',  forceY);

    const svg = d3.select(".main-container .graph-visualization").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // building rectangular so we can bind zoom and drag effects
    svg.append("rect")
        .attr("width", width * 10)
        .attr("height", height * 10)
        .attr("x", -(width * 10 - width) / 2)
        .attr("y", -(height * 10 - height) / 2)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoomLayout)
        .on("click", function (event) {
            event.stopPropagation();
            removeMenuIfVisible();
            // Clicking outside the graph stops the layout
            force.stop();
        });

    let showNodeTipAndIconsTimer = 0;
    let removeIconsTimer = 0;

    const loader = new Loader();

    function draw(resetRootNode) {
        // remove all group elements and rec to rebuild the graph when the user clicks on it
        d3.selectAll("svg g").remove();
        d3.selectAll('.d3-tip').remove();
        d3.selectAll('.menu-events').remove();


        container = svg.append("g").attr("class", "nodes-container")
            .attr("transform", function () {
                if (angular.isDefined(transformValues) && !resetRootNode) {
                    return transformValues;
                }
                return '';
            });

        const tip = d3tip()
            .attr('class', 'd3-tip')
            .customPosition(function () {
                const bbox = tipElement.getBoundingClientRect();
                return {
                    top: (bbox.bottom + 10) + 'px',
                    left: (bbox.left - 30) + 'px'
                };
            })
            .html(function (d) {
                let html = '';

                if (d.fixed) {
                    // add pin icon if pinned down
                    html += '<i class="icon-pin"></i>&nbsp;&nbsp;';
                }

                if (d.types.length > 0) {
                    html += d.types
                        .map((type) => `<div> \u00B7 ${$scope.replaceIRIWithPrefix(type)}</div>`)
                        .join('');
                } else {
                    html += `<i>${$translate.instant('visual.node.tooltip.no_types')}</i>`;
                }
                return html;
            });

        const numberOfPredLeft = function (d) {
            return d.predicates.length - 10;
        };

        // This will create text that will appear in d3tip
        const createTipText = function (d) {
            let html = '';
            html += _.join(_.map(d.predicates, function (p, index) {
                if (index === 0) {
                    return getShortPredicate(p);
                    // If we have less than or ten predicates should show them with middle dot separated
                } else if (index < 10) {
                    return ' \u00B7 ' + getShortPredicate(p);
                    // On eleventh predicate just append how many more predicates left to show to the user
                } else if (index === 10) {
                    const numOfPredLeft = numberOfPredLeft(d);
                    // Show how many predicates left
                    const textToShow = numOfPredLeft > 1 ? numOfPredLeft + ' predicates'
                        : numOfPredLeft + ' predicate';
                    return ' \u00B7 ' + $translate.instant('graphexplore.tip.text', {textToShow: textToShow});
                }
            }), '');

            return html;
        };

        const calculateWidth = function (d) {
            const text = createTipText(d);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext("2d");
            ctx.font = "13px Arial";

            if (d.predicates.length < 10) {
                return ctx.measureText(text).width;
            } else {
                return ctx.measureText(text).width / 2;
            }
        };

        let tipPredicateElement;
        let tipPredicateTimer;

        const tipPredicates = d3tip()
            .attr('class', 'd3-tip')
            .customPosition(function (d) {
                const bbox = tipPredicateElement.getBoundingClientRect();
                const textWidth = calculateWidth(d);
                return {
                    top: (bbox.top - 30) + 'px',
                    left: (bbox.left - 30) + 'px',
                    width: textWidth + 'px'
                };
            })
            .html(function (d) {
                return createTipText(d);
            });

        let tipTimer;
        // Shows the tooltip for a node but with a slight delay
        const showTipForNode = function (d, event) {
            $timeout.cancel(tipTimer);
            const thisTipElement = tipElement = event.target;
            $timeout(function () {
                if (tipElement === thisTipElement) {
                    tip.show(d, tipElement);
                }
            }, 300);
        };

        // Hides the tooltip for the node and resets some variables
        const hideTipForNode = function () {
            $timeout.cancel(tipTimer);
            $timeout.cancel(showNodeTipAndIconsTimer);
            tipElement = null;
            tip.hide();
            removeIconsTimer = $timeout(function () {
                removeMenuIfVisible();
            }, 500);
        };

        // Updates the text in the tooltip if already visible
        const updateTipForNode = function (d) {
            if (tipElement) {
                tip.show(d, tipElement);
            }
        };

        svg.call(tip);

        // Shows like tooltip list of predicates but with a slight delay
        const showPredicateToolTip = function (event, d) {
            $timeout.cancel(tipPredicateTimer);
            const thisPredicateTipElement = tipPredicateElement = event.target;
            $timeout(function () {
                if (tipPredicateElement === thisPredicateTipElement && d.predicates.length > 1) {
                    tipPredicates.show(d, tipPredicateElement);
                }
            }, 300);
        };

        // Hides the tooltip with predicates and resets some variables
        const hidePredicateToolTip = function () {
            $timeout.cancel(tipPredicateTimer);
            tipPredicateElement = null;
            tipPredicates.hide();
        };

        svg.call(tipPredicates);

        let link = svg.selectAll(".link");
        let node = svg.selectAll(".node");

        const collisionForce = d3.forceCollide((d) => d.size + 5).strength(0.5)
        const chargeForce = d3.forceManyBody().strength(-300);
        const centerForce = d3.forceCenter(width/2,  height/2)

        force.nodes(graph.nodes)
            .force("charge", chargeForce)
            .force("collide", collisionForce)
            .force("center", centerForce)
            .force("link", d3.forceLink(graph.links).distance(function (l) {
                if (l.source.isTriple || l.target.isTriple) {
                    return 0;
                }
                // link distance depends on length of text with an added bonus for strongly connected nodes,
                // i.e. they will be pushed further from each other so that their common nodes can cluster up
                return getPredicateTextLength(l) + 30 * l.connectedness;
            }));

        // arrow markers
        container.append("defs").selectAll("marker")
            .data(graph.links)
            .enter().append("marker")
            .attr("class", "arrow-marker")
            .attr("id", function (d) {
                return createArrowMarkerUniqueID(d);
            })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", function (d) {
                // The positioning of the arrow for triple target nodes differ from normal ones
                return d.target.isTriple ? 11 : d.target.size + 11;
            })
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5");

        // add the links, nodes, predicates and node labels
        link = container.selectAll(".link")
            .data(graph.links)
            .enter().append("g")
            .attr("class", "link-wrapper")
            .attr("id", function (d) {
                return removeSpecialChars(convertLinkDataToLinkId(d));
            })
            .append("line")
            .attr("class", "link")
            .style("stroke-width", 1)
            .style("fill", "transparent")
            .style("marker-end", function (d) {
                const targetArrowId = createArrowMarkerUniqueID(d);
                return `url(#${targetArrowId})`;
            });

        const predicate = container.selectAll(".link-wrapper")
            .append("text")
            .text(function (d) {
                return getPredicate(d);
            })
            .attr("class", function (d) {
                if (d.predicates.length > 1 || graph.tripleNodes.has(convertLinkDataToLinkId(d))) {
                    return "predicates";
                }
                return "predicate";
            })
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .style("display", getSettings()['showLinksText'] ? "" : "none")
            .on("mouseover", function (event, d) {
                event.stopPropagation();
                showPredicateToolTip(event, d);
            })
            .on('mouseout', hidePredicateToolTip)
            .on("click", function (event, d) {
                event.stopPropagation();
                linkActions(event, d);
            });

        // node events and variables
        let touchHoldEventTimer;
        let upEventLast = 0;
        let moveEventCount = 0;
        let singleClickTimer = null;
        let clickTarget = null;

        // track single and double click events
        const clickEventHandler = function (event, d) {
            if (event.button && event.button !== 0) {
                return;
            }

            const element = this;

            if (singleClickTimer && clickTarget === element) {
                $timeout.cancel(singleClickTimer);
                singleClickTimer = null;
                // expand node
                expandEventHandler(d, 0, element.parentNode);
                return;
            }

            clickTarget = element;


            hideTipForNode();
            $scope.showPredicates = false;

            if (!GuidesService.isActive()) {
                $timeout.cancel(singleClickTimer);
                // Show node info
                singleClickTimer = $timeout(function () {
                    clickedNode(d, element, event);
                    singleClickTimer = null;
                }, 40 + multiClickDelay)
            }
        };

        // builds upon clickEventHandler and adds additional functionality for touch devices
        const touchStartEventHandler = function (d) {
            // for touch devices we track touch and hold for 1s in order to remove a node
            moveEventCount = 0;
            touchHoldEventTimer = $timeout(function () {
                if (moveEventCount < 5) {
                    // remove the node only if not many move events were fired,
                    // this avoids conflict with dragging nodes
                    hideNode(d);
                }
                touchHoldEventTimer = null;
            }, 1000);
        };

        const touchEndEventHandler = function () {
            $timeout.cancel(touchHoldEventTimer);
            touchHoldEventTimer = null;
        };

        // tracks the number of move events (checked in the touchend event handler)
        const moveEventHandler = function () {
            moveEventCount++;
        };

        const showNodeTipAndIcons = function (event, d) {
            if (!d.isBeingDragged) {
                $timeout.cancel(removeIconsTimer);
                showNodeTipAndIconsTimer = $timeout(() => {
                    if (expandNodeIcons(d, this)) {
                        showTipForNode(d, event);
                    }
                }, 400);
            }
        };

        const expandEventHandler = function (d, i, parentNode) {
            let parent = parentNode || this.parentNode;
            if (Array.isArray(parentNode)) {
                parent = parentNode[i]
            }
            const shownLinks = graph.countLinks(d, graph.links);
            if (shownLinks <= getSettings()['linksLimit']) {
                expandNode(d, false, parent);
            } else {
                toastr.info($translate.instant('graphexplore.increase.limit'), $translate.instant('graphexplore.node.at.max'));
            }
            $scope.closeInfoPanel();
        };

        // Shows growing or shrinking pin animation
        function showPinAnimation(d, type) {
            let startSize;
            let endSize;
            let startOpacity;
            let endOpacity;
            let animate = true;

            if (type === 'down') {
                startSize = d.size * 2;
                endSize = d.size / 3;
                startOpacity = 0.8;
                endOpacity = 0.3;
            } else if (type === 'down-fixed') {
                startSize = d.size * 2;
                endSize = d.size;
                startOpacity = 0.8;
                endOpacity = 0.66;
            } else if (type === 'up') {
                startSize = d.size / 3;
                endSize = d.size * 2;
                startOpacity = 0.3;
                endOpacity = 0.8;
            } else if (type === 'fixed') {
                startSize = d.size;
                startOpacity = 0.66;
                animate = false;
            } else {
                return; // unknown
            }

            let pin = container.selectAll('.node-wrapper')
                .filter(function (innerD) {
                    return innerD === d;
                })
                .append('text')
                .text('\ue90f') // pin icon
                .classed('icon-any pinned', true)
                .style('font-size', startSize + 'px')
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .attr('opacity', startOpacity);

            if (type === 'fixed' || type === 'down-fixed') {
                d.pin = pin;
            }

            if (animate) {
                pin = pin.transition()
                    .duration(1000)
                    .style('font-size', function () {
                        return endSize + 'px';
                    })
                    .attr('opacity', endOpacity);

                if (type !== 'down-fixed') {
                    pin.remove();
                }
            }
        }

        function removePin() {
            d3.select('.pinned').remove();
        }

        // Unfixes nodes that were dragged previously
        const rightClickHandler = function (event, d) {
            if (event.shiftKey) {
                // Do nothing with shift key, use to access context menu
                return;
            }

            event.preventDefault();

            removeMenuIfVisible();
            $scope.closeInfoPanel();

            if (d.fixed) {
                // unpin
                $scope.numberOfPinnedNodes--;
                d.fixed = false;
                d.fx =null;
                d.fy =null;
                showPinAnimation(d, 'up');
                force.alpha(1).restart();
            } else {
                // pin down
                $scope.numberOfPinnedNodes++;
                d.fixed = true;
                showPinAnimation(d, 'down');
            }
            // update pin in tooltip
            updateTipForNode(d);
        };

        const drag = d3.drag()
            .subject(function (d) {
                return d;
            })
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);


        function dragstarted(event, d) {
            if (GuidesService.isActive()) {
                // disable dragging if a guide is active.
                return;
            }
            if (event.sourceEvent.button === 0) {
                d.fixedBeforeDrag = d.fixed;
                d.isBeingDragged = true;
                d.beginDragging = true;
                removeMenuIfVisible();
                d3.select(this).classed("dragging", true);
                force.alphaTarget(0.3).restart();
            }
        }

        function dragged(event, d) {
            if (d.isBeingDragged) {
                d.fx = event.x;
                d.fy = event.y;
                if (!d.fixed) {
                    $scope.numberOfPinnedNodes++;
                    d.fixed = true;
                    showPinAnimation(d, 'down-fixed');
                } else if (d.beginDragging) {
                    showPinAnimation(d, 'fixed');
                }
                d.pinWasFixed = true;
                d.beginDragging = null;
            }
        }

        function dragended(event, d) {
            if (d.isBeingDragged) {
                if (d.pinWasFixed) {
                    d.pinWasFixed = null;
                    removePin();
                }
                d.isBeingDragged = false;
                d3.select(this).classed("dragging", false);
            }
            force.alphaTarget(0)
        }

        node = container.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node-wrapper")
            .attr("id", function (d) {
                return d.iri;
            })
            .append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return d.size;
            })
            .style("fill", function (d) {
                if (d.types === "greyColor") {
                    return "c2c2c2";
                }
                return $scope.getColor(d.types[0]);
            })
            .on('mouseover', showNodeTipAndIcons)
            .on('mouseout', hideTipForNode)
            .on("click", clickEventHandler)
            .on("touchstart", (event, d) => touchStartEventHandler(d))
            // no need to track move for mouse
            .on("touchmove", moveEventHandler)
            .on("touchend", touchEndEventHandler)
            .on("contextmenu", rightClickHandler)
            // custom event used when user is following a guide
            .on("gdb-expand-node", (event, d) => expandEventHandler(d, 0, event.srcElement.parentNode))
            // custom event used when user is following a guide
            .on("gdb-show-node-info", (event, d) => showNodeInfo(d))
            .call(drag);

        const nodeLabels = container.selectAll(".node-wrapper").append("foreignObject")
            .style("pointer-events", "none")
            .attr("width", function (d) {
                return d.size * 2 * nodeLabelRectScaleX;
            });
        // height will be computed by updateNodeLabels

        container.insert("g").attr("class", "menu-events");

        updateNodeLabels(nodeLabels);

        force.on("tick", function () {
            // recalculate links attributes
            link.attr("x1", function (d) {
                return getNodeX(d.source);
            }).attr("y1", function (d) {
                return getNodeY(d.source);
            }).attr("x2", function (d) {
                return getNodeX(d.target);
            }).attr("y2", function (d) {
                return getNodeY(d.target);
            });

            // recalculate predicates attributes
            predicate.attr("x", function (d) {
                let sourceX = getNodeX(d.source);
                let targetX = getNodeX(d.target);
                return d.x = (sourceX + targetX) * 0.5;
            }).attr("y", function (d) {
                let sourceY = getNodeY(d.source);
                let targetY = getNodeY(d.target);
                return d.y = (sourceY + targetY) * 0.5;
            }).attr("transform", function (d) {
                const angle = findAngleBetweenNodes(d, d.direction);
                return "rotate(" + angle + ", " + d.x + ", " + d.y + ")";
            });

            // recalculate nodes attributes
            node.attr("cx", function (d) {
                return d.x;
            }).attr("cy", function (d) {
                return d.y;
            });

            // update node loader position
            container.select(".node-loader").attr("x", function (d) {
                return d.x - d.size + 3; //square svg is not perfectly centered and need +3 units on x ordinate to fit in circle
            }).attr("y", function (d) {
                return d.y - d.size;
            });

            container.select(".loader-container").attr("cx", function (d) {
                return d.x;
            }).attr("cy", function (d) {
                return d.y;
            });

            nodeLabels.attr("x", function (d) {
                return d.x - (d.size * nodeLabelRectScaleX);
            }).attr("y", function (d) {
                // the height of the nodeLabel box is 3 times the fontSize computed by updateNodeLabels
                // and we want to offset it so that its middle matches the centre of the circle, hence divided by 2
                return d.y - 3 * d.fontSize / 2;
            });

            // Update position of shrinking pin animation (if any)
            d3.select('.pinned').attr("x", function (d) {
                return d.x;
            }).attr("y", function (d) {
                return d.y;
            });

            updateAlphaInScope();
        });

        if (angular.isDefined(loader)) {
            loader.setLoadingState(false);
        }

        if ($scope.loading) {
            $scope.loading = false;
        }

        d3.selectAll('.link-wrapper').each(function () {
            const source = $(this).attr("id").split(">")[0];
            const target = $(this).attr("id").split(">")[1];
            d3.selectAll('.link').each(function (link) {
                const sourceId = removeSpecialChars(link.source.iri);
                const targetId = removeSpecialChars(link.target.iri);
                if (sourceId === target && targetId === source) {
                    let twoWayLinkID = sourceId;
                    twoWayLinkID += ">";
                    twoWayLinkID += targetId;
                    const textNode = document.createTextNode('  \u27F6');
                    document.getElementById(twoWayLinkID).lastChild.appendChild(textNode);
                    link.direction = "double";
                }
            });
        });

        d3.selectAll('.d3-actions-tip').remove();

        force.alpha(0.3).restart();
    }

    function updateAlphaInScope() {
        // other code can use the value of d3alpha to determine when the force layout has settled
        $rootScope.d3alpha = force.alpha();
    }

    // find angle between pair of nodes so we can position predicates
    function findAngleBetweenNodes(linkedNodes, direction) {
        const p1 = {
            x: getNodeX(linkedNodes.source),
            y: getNodeY(linkedNodes.source)
        };

        const p2 = {
            x: getNodeX(linkedNodes.target),
            y: getNodeY(linkedNodes.target)
        };
        if (direction) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        } else {
            const angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
            if (angleDeg <= 90 && angleDeg >= -90) {
                return angleDeg;
            }
            return (angleDeg > 0 ? -1 : 1) * (180 - Math.abs(angleDeg));
        }
    }

    const menuEvents = new MenuEvents();

    // expanding and collapsing of the nodes
    function clickedNode(d, element, event) {
        $scope.showInfoPanel = false;
        $scope.showPredicates = false;
        $scope.showNodeInfo = false;

        // shift + ctrl/cmd + click focuses node
        if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
            $rootScope.$broadcast("onRootNodeChange", d.iri);
            return false;
        }

        // ctrl/cmd + click hides the node
        if (event.ctrlKey || event.metaKey) {
            hideNode(d);
            return false;
        }

        // If value of openedNodeInfoPanel is different than "undefined"
        // we evaluate if clicked node value is the same and close it
        if (typeof $scope.openedNodeInfoPanel !== "undefined" && $scope.openedNodeInfoPanel === d) {
            $scope.pageslideExpanded = false;
            $scope.openedNodeInfoPanel = undefined;
            return false;
        }

        showNodeInfo(d);
        return true;
    }

    function expandNodeIcons(d, element) {
        if ($scope.showInfoPanel) {
            return false;
        }

        if (menuEvents.closeIcon || menuEvents.expandIcon || menuEvents.focusIcon || menuEvents.copyURIIcon) {
            menuEvents.removeIcons();
        }

        // If nodes are still rearranging result of force.alpha() is more than 0.02
        // and we don't want to show node's icons on mouse over and stop rearrangement.
        // The chosen value 0.1 is somewhat magic and works well with 0.02 in awaitAlphaDropD3()
        // in the guides code.
        if (force.alpha() < 0.1) {
            menuEvents.initIcons(d, element.parentNode);
            force.stop();
            updateAlphaInScope();

            return true;
        }

        return false;
    }

    function hideNode(d) {
        graph.removeNode(d);
        draw();
    }

    function collapseNode(d) {
        d.isExpanded = false;
        graph.removeNodeLeafLinks(d);
        draw();
    }

    function initGraph(response) {
        $scope.nodeSelected = true;
        if (response.data.types === null) {
            response.data.types = "greyColor";
        }
        graph = new Graph();
        transformValues =  INITIAL_CONTAINER_TRANSFORM;
    }

    function initGraphFromResponse(response) {
        initGraph(response);
        renderGraphFromResponse(response);
    }

    function renderGraphFromResponse(response, d, isStartNode) {
        let linksFound = response.data;
        // filter existing links
        linksFound = _.filter(linksFound, function (newLink) {
            return _.findIndex(graph.links,
                function (existingLink) {
                    return newLink.source === existingLink.source.iri && newLink.target === existingLink.target.iri;
                }) === -1;
        });
        const linksCopy = [];
        const tripleLinksIt = graph.tripleLinksCopy.values();
        for (let i = 0; i < graph.tripleLinksCopy.size; i++) {
            const linkCopy = tripleLinksIt.next().value;
            linkCopy.forEach((link) => {
                linksCopy.push(link);
            });
        }
        // filter existing shadow links
        linksFound = _.filter(linksFound, function (newLink) {
            return _.findIndex(linksCopy,
                function (existingLink) {
                    return newLink.source === existingLink.source.iri && newLink.target === existingLink.target.iri;
                }) === -1;
        });
        // filter reflexive links until we find a way to render them  GDB-1853
        linksFound = _.filter(linksFound, function (newLink) {
            return newLink.source !== newLink.target;
        });
        const nodesFromLinks = distinctBy('iri', _.union(_.flatten(_.map(response.data, function (link) {
            return [
                {iri: link.source, isTriple: link.isTripleSource},
                {iri: link.target, isTriple: link.isTripleTarget}
            ];
        }))));
        const existingNodes = _.map(graph.nodes, function (n) {
            return {
                iri: n.iri,
                isTriple: Boolean(n.isTriple)
            };
        });
        const tripleNodesIt = graph.tripleNodes.values();
        for (let i = 0; i < graph.tripleNodes.size; i++) {
            const nodes = tripleNodesIt.next().value;
            nodes.forEach((node) => {
                existingNodes.push({
                    iri: node.iri,
                    isTriple: node.isTriple
                });
            });
        }
        const newNodes = _.reject(nodesFromLinks, function (n) {
            return _.some(existingNodes, n);
        });

        if (newNodes.length === 0) {
            if (isStartNode) {
                toastr.info($translate.instant('graphexplore.error.node.connections'));
            } else if (linksFound.length === 0) {
                toastr.info($translate.instant('graphexplore.error.node.connections'));
            }

            graph.addAndMatchLinks(linksFound);
            draw();
        } else {
            const promises = [];
            const newNodesData = [];

            const settings = getSettings();

            _.forEach(newNodes, function (newNode, index) {
                promises.push(GraphDataRestService.getInstanceNode({
                    iri: newNode.isTriple ? createTriple(newNode.iri) : newNode.iri,
                    config: $scope.configLoaded.id,
                    languages: !$scope.shouldShowSettings() ? [] : settings['languages'],
                    includeInferred: settings['includeInferred'],
                    sameAsState: settings['sameAsState']
                }).then(function (res) {
                    // Save the data for later
                    newNodesData[index] = res.data;
                }));
            });

            // Waits for all of the collected promises and then:
            // - adds each new node
            // - redraws the graph
            $q.all(promises).then(function () {
                _.forEach(newNodesData, function (newNodeData, index) {
                    // Calculate initial positions for the new nodes based on spreading them evenly
                    // on a circle around the node we came from.
                    const theta = 2 * Math.PI * index / newNodesData.length;
                    const x = (d ? d.x : 0) + Math.cos(theta) * height / 3;
                    const y = (d ? d.y : 0) + Math.sin(theta) * height / 3;
                    if (newNodeData.isTriple) {
                        graph.addTriple(newNodeData, x, y);
                    } else {
                        graph.addNode(newNodeData, x, y);
                    }
                });

                graph.addAndMatchLinks(linksFound);
                if (d) {
                    d.isExpanded = true;
                }
                draw();
            });
        }
    }

    function expandNode(d, isStartNode, parentNode) {
        if (loader.getLoadingState()) {
            return;
        }
        loader.init(d, parentNode);

        const settings = getSettings();
        const expandIri = d.iri;
        GraphDataRestService.getInstanceNodeLinks({
            iri: expandIri, linksLimit: settings['linksLimit'],
            includeInferred: settings['includeInferred'],
            config: $scope.configLoaded.id,
            preferredTypes: !$scope.shouldShowSettings() ? [] : settings['preferredTypes'],
            rejectedTypes: !$scope.shouldShowSettings() ? [] : settings['rejectedTypes'],
            preferredPredicates: !$scope.shouldShowSettings() ? [] : settings['preferredPredicates'],
            rejectedPredicates: !$scope.shouldShowSettings() ? [] : settings['rejectedPredicates'],
            preferredTypesOnly: !$scope.shouldShowSettings() ? [] : settings['preferredTypesOnly'],
            preferredPredicatesOnly: !$scope.shouldShowSettings() ? [] : settings['preferredPredicatesOnly'],
            languages: !$scope.shouldShowSettings() ? [] : settings['languages'],
            sameAsState: settings['sameAsState'],
            includeSchema: settings['includeSchema']
        }).then(function (response) {
            renderGraphFromResponse(response, d, isStartNode);
        }, function (response) {
            const msg = getError(response.data);
            toastr.error(msg, $translate.instant('graphexplore.error.exploring.node'));
            $scope.loading = false;
            loader.setLoadingState(false);
        });
    }

    function removeMenuIfVisible() {
        if (angular.isDefined(menuEvents) && menuEvents.expandedState) {
            menuEvents.removeIcons();
        }
    }

    function MenuEvents() {
        this.closeIcon = undefined;
        this.expandIcon = undefined;
        this.collapseIcon = undefined;
        this.focusIcon = undefined;
        this.copyURIIcon = undefined;
        this.actionsTip = undefined;

        this.removeIcons = function () {
            this.closeIcon.remove("g");
            if (this.expandIcon) {
                this.expandIcon.remove("g");
            }

            if (this.collapseIcon) {
                this.collapseIcon.remove("g");
            }

            this.focusIcon.remove("g");
            this.copyURIIcon.remove("g");
            this.closeIcon = undefined;
            this.expandIcon = undefined;
            this.collapseIcon = undefined;
            this.focusIcon = undefined;
            this.copyURIIcon = undefined;

            this.expandedState = false;
        };

        this.expandedState = false;

        function getPositionAndAngle(angle, d) {
            const x = d.x - 14 + (d.size + 15) * Math.cos(angle * Math.PI / 180 - Math.PI / 2);
            const y = d.y - 14 + (d.size + 15) * Math.sin(angle * Math.PI / 180 - Math.PI / 2);
            return "translate(" + x + "," + y + ")";
        }

        this.initIcons = function (node, parentNode) {
            // init action tips on hover of the icons
            const actionsTip = d3tip()
                .attr('class', 'd3-tip d3-actions-tip')
                .customPosition(function (d, event) {
                    const bbox = event.target.getBoundingClientRect();
                    return {
                        top: (bbox.top - 20) + 'px',
                        left: (bbox.right + 10) + 'px'
                    };
                })
                .html(function (name) {
                    return name;
                });
            svg.call(actionsTip);
            const angle = 20;
            if (node.isExpanded) {
                this.collapseIcon = d3.select('.menu-events').append("g")
                    .attr("class", "collapse-icon")
                    .attr("name", "collapse")
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    });
                this.collapseIcon.append("circle")
                    .attr("cx", 14)
                    .attr("cy", 14)
                    .attr("r", 13)
                    .style("fill", "#eee");
                this.collapseIcon.append("path")
                    .attr("d", "M22.67,12a.59.59,0,0,1-.53.65l-6.88.72H15.2a.59.59,0,0,1-.59-.65l.72-6.88A.58.58,0,0,1,16,5.33a.59.59,0,0,1,.53.65L16,11.11,21.3,5.79a.64.64,0,0,1,.91.91L16.89,12,22,11.49A.59.59,0,0,1,22.67,12ZM12.59,14.75l-6.75.85a.59.59,0,0,0-.51.66.58.58,0,0,0,.66.51l4.95-.62-5.2,5.2a.64.64,0,1,0,.91.91l5.2-5.2L11.23,22a.59.59,0,0,0,.51.66h.07a.59.59,0,0,0,.59-.52l.85-6.75a.59.59,0,0,0-.17-.49A.58.58,0,0,0,12.59,14.75Z")
                    .style("fill", "var(--primary-color)");

                this.collapseIcon.on("click", function () {
                    collapseNode(node);
                }).on('mouseover', function (event) {
                    actionsTip.show(this.getAttribute("name"), event);
                    $timeout.cancel(showNodeTipAndIconsTimer);
                    $timeout.cancel(removeIconsTimer);
                }).on('mouseout', function () {
                    actionsTip.hide();
                    removeIconsTimer = $timeout(function () {
                        removeMenuIfVisible();
                    }, 500);
                });
            } else {
                this.expandIcon = d3.select('.menu-events').append("g")
                    .attr("class", "expand-icon")
                    .attr("name", "expand")
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    });
                this.expandIcon.append("circle")
                    .attr("cx", 14)
                    .attr("cy", 14)
                    .attr("r", 13)
                    .style("fill", "#eee");
                this.expandIcon.append("path")
                    .attr("d", "M22.37,6.28l-.72,6.88a.59.59,0,0,1-.59.53H21a.59.59,0,0,1-.53-.65L21,7.9l-5.32,5.32a.64.64,0,0,1-.91-.91L20.1,7,15,7.53a.59.59,0,0,1-.12-1.18l6.88-.72a.59.59,0,0,1,.65.65ZM12.89,20.34,7.95,21l5.2-5.2a.64.64,0,0,0-.91-.91L7,20.05l.62-4.95A.59.59,0,0,0,6.48,15l-.85,6.75a.59.59,0,0,0,.59.67h.07L13,21.52a.59.59,0,1,0-.15-1.18Z")
                    .style("fill", "var(--primary-color)");

                this.expandIcon.on("click", function () {
                    expandNode(node, false, parentNode);
                }).on('mouseover', function (event) {
                    actionsTip.show(this.getAttribute("name"), event);
                    $timeout.cancel(removeIconsTimer);
                    $timeout.cancel(showNodeTipAndIconsTimer);
                }).on('mouseout', function () {
                    actionsTip.hide();
                    removeIconsTimer = $timeout(function () {
                        removeMenuIfVisible();
                    }, 500);
                });
            }

            this.focusIcon = d3.select('.menu-events').append("g")
                .attr("class", "focus-icon")
                .attr("name", "focus")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.focusIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.focusIcon.append("path")
                .attr("d", "M14.2,23.81a9.8,9.8,0,1,1,6.93-2.87h0A9.74,9.74,0,0,1,14.2,23.81Zm0-18.17a8.37,8.37,0,1,0,5.92,14.29h0A8.37,8.37,0,0,0,14.2,5.64Zm1.42,6.95a2,2,0,1,0,0,2.85A2,2,0,0,0,15.62,12.59Z")
                .style("fill", "var(--primary-color)");

            this.focusIcon.on("click", function () {
                $rootScope.$broadcast("onRootNodeChange", node.iri);
            }).on('mouseover', function (event) {
                actionsTip.show(this.getAttribute("name"), event);
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });

            this.copyURIIcon = d3.select('.menu-events').append("g")
                .attr("class", "icon-link")
                .attr("name", "link")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.copyURIIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.copyURIIcon.append("path")
                .attr("d", "M 13.457031 10.164062 C 13.648438 10.164062 13.820312 10.242188 13.941406 10.363281 L 15.492188 11.859375 C 15.984375 12.332031 16.292969 12.992188 16.292969 13.714844 C 16.292969 14.441406 15.984375 15.097656 15.492188 15.574219 L 10.394531 20.496094 C 9.902344 20.972656 9.222656 21.265625 8.472656 21.265625 C 7.71875 21.265625 7.039062 20.972656 6.546875 20.496094 L 4.996094 19 C 4.507812 18.523438 4.203125 17.867188 4.203125 17.144531 C 4.203125 16.421875 4.507812 15.765625 4.996094 15.289062 L 7.542969 12.824219 C 7.667969 12.707031 7.84375 12.628906 8.035156 12.628906 C 8.417969 12.628906 8.726562 12.929688 8.726562 13.300781 C 8.726562 13.484375 8.648438 13.652344 8.523438 13.773438 L 5.976562 16.234375 C 5.738281 16.46875 5.589844 16.792969 5.589844 17.148438 C 5.589844 17.503906 5.738281 17.824219 5.976562 18.058594 L 7.527344 19.566406 C 7.773438 19.792969 8.105469 19.929688 8.472656 19.929688 C 8.835938 19.929688 9.167969 19.792969 9.414062 19.566406 L 14.511719 14.644531 C 14.753906 14.410156 14.90625 14.089844 14.90625 13.730469 C 14.90625 13.375 14.753906 13.054688 14.511719 12.820312 L 12.964844 11.324219 C 12.839844 11.203125 12.761719 11.039062 12.761719 10.855469 C 12.761719 10.488281 13.070312 10.1875 13.449219 10.1875 Z M 17.082031 3.976562 C 17.082031 3.976562 17.085938 3.976562 17.085938 3.976562 C 17.824219 3.976562 18.492188 4.261719 18.980469 4.722656 L 20.535156 6.203125 C 21.042969 6.679688 21.355469 7.34375 21.355469 8.082031 C 21.355469 8.792969 21.058594 9.441406 20.582031 9.914062 L 18.0625 12.402344 C 17.9375 12.527344 17.761719 12.605469 17.566406 12.605469 C 17.183594 12.605469 16.875 12.304688 16.875 11.9375 C 16.875 11.753906 16.949219 11.589844 17.070312 11.46875 L 19.605469 8.984375 C 19.847656 8.75 19.996094 8.429688 19.996094 8.070312 C 19.996094 7.714844 19.847656 7.394531 19.605469 7.160156 L 18.019531 5.667969 C 17.773438 5.445312 17.4375 5.304688 17.070312 5.300781 C 16.703125 5.304688 16.367188 5.453125 16.128906 5.691406 L 11.085938 10.667969 C 10.84375 10.898438 10.695312 11.222656 10.695312 11.578125 C 10.695312 11.933594 10.84375 12.257812 11.085938 12.488281 L 12.675781 13.980469 C 12.804688 14.101562 12.882812 14.273438 12.882812 14.457031 C 12.882812 14.828125 12.574219 15.128906 12.191406 15.128906 C 12.003906 15.128906 11.832031 15.054688 11.707031 14.9375 L 10.140625 13.457031 C 9.636719 12.980469 9.324219 12.316406 9.324219 11.582031 C 9.324219 10.863281 9.621094 10.214844 10.101562 9.742188 L 15.140625 4.765625 C 15.625 4.285156 16.304688 3.980469 17.054688 3.976562 Z M 17.082031 3.976562")
                .style("fill", "var(--primary-color)");

            this.copyURIIcon.on("click", function () {
                $scope.copyToClipboard(node.iri);
                removeMenuIfVisible();
                actionsTip.hide();
            }).on('mouseover', function (event) {
                actionsTip.show("<div style='text-align: center;'><b>Copy to ClipBoard</b><br>" + node.iri + "</div>", event);
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });

            this.closeIcon = d3.select('.menu-events').append("g")
                .attr("class", "close-icon")
                .attr("name", "remove")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.closeIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.closeIcon.append("path")
                .attr("d", "M14.94,14l5.87-5.87a.66.66,0,1,0-.94-.94L14,13.06,8.13,7.19a.66.66,0,0,0-.94.94L13.06,14,7.19,19.87a.66.66,0,1,0,.94.94L14,14.94l5.87,5.87a.66.66,0,1,0,.94-.94Z")
                .style("fill", "var(--primary-color)");

            this.closeIcon.on("click", function () {
                hideNode(node);
            }).on('mouseover', function (event) {
                actionsTip.show(this.getAttribute("name"), event);
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });

            this.animateMenu(node);
        };

        this.animateMenu = function (node) {
            const animationDuration = 100;
            const easeEffect = d3.easeSin;
            let delay = 0;
            const dellayAddition = 35;
            let angle = 20; // angle of the first icon 0 is at 12 o'clock

            if (this.expandIcon) {
                this.expandIcon
                    .transition()
                    .duration(animationDuration)
                    .style("opacity", 1)
                    .ease(easeEffect)
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    })
                    .delay(delay += dellayAddition);
            }

            if (this.collapseIcon) {
                this.collapseIcon
                    .transition()
                    .duration(animationDuration)
                    .style("opacity", 1)
                    .ease(easeEffect)
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    })
                    .delay(delay += dellayAddition);
            }

            this.copyURIIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function () {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);

            this.focusIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function () {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);


            this.closeIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function () {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);

            this.expandedState = true;
        };
    }

    function Loader() {
        this.state = false;

        this.setLoadingState = function (state) {
            this.state = state;
        };

        this.getLoadingState = function () {
            return this.state;
        };

        this.init = function (node, parentNode) {
            d3.select(parentNode).append("circle")
                .attr("cx", function () {
                    return node.x;
                })
                .attr("cy", function () {
                    return node.y;
                })
                .attr("class", "loader-container")
                .attr("r", function () {
                    return node.size;
                })
                .style("fill", "fff")
                .style("opacity", "0.7");

            d3.select(parentNode).append("image")
                .attr("xlink:href", "js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]")
                .attr("x", function () {
                    return node.x - node.size + 5;
                })
                .attr("y", function () {
                    return node.y - node.size;
                })
                .attr("width", function () {
                    return node.size * 2;
                })
                .attr("height", function () {
                    return node.size * 2;
                })
                .attr("class", "node-loader");
        };
    }

    function showNodeInfo(d) {
        force.stop();
        // Assign value of node, which info panel has been opened
        $scope.openedNodeInfoPanel = d;
        $scope.showNodeInfo = true;
        $scope.showFilter = false;
        $scope.showPredicates = false;
        $scope.nodeLabels = d.labels;
        $scope.nodeTypes = d.types;
        $scope.rdfRank = d.rdfRank;
        $scope.nodeIri = d.iri;
        $scope.resourceType = d.isTriple ? 'triple' : 'uri';
        $scope.encodedIri = d.isTriple ? encodeURIComponent(createTriple(d.iri)) : encodeURIComponent(d.iri);
        $scope.showInfoPanel = true;

        $scope.rdfsLabel = d.labels[0].label;
        $scope.rdfsComment = d.comment;
        $scope.expanded = false;

        $scope.propertiesQueryObj.query = '';
        $scope.dataNodeKeysQuery = '';
        const settings = getSettings();
        GraphDataRestService.getProperties({
            iri: d.isTriple ? createTriple(d.iri) : d.iri,
            config: $scope.configLoaded.id,
            languages: !$scope.shouldShowSettings() ? [] : settings['languages'],
            includeInferred: settings['includeInferred'],
            sameAsState: settings['sameAsState'],
            rejectedPredicates: !$scope.shouldShowSettings() ? [] : settings['rejectedPredicates']
        }).then(function (response) {
            $scope.data = _.mapKeys(response.data, function (value, key) {
                return $scope.replaceIRIWithPrefix(key);
            });
            $scope.propertiesObj.items = [];

            _.forEach($scope.data, function (value, key) {
                $scope.propertiesObj.items.push({key: key, value: value});
            });
            $scope.nodeImage = undefined;

            $scope.propertiesNotFiltered = $scope.propertiesObj.items;

            const imageVal = _.find($scope.propertiesObj.items, function (o) {
                return o.key === 'image';
            });
            if (imageVal) {
                $scope.nodeImage = imageVal['value'][0].v;
            }
            $scope.propertiesObj.items = _.reject($scope.propertiesObj.items, function (o) {
                return o.key === 'image';
            });
            $scope.propertiesNotFiltered = $scope.propertiesObj.items;
        }, function (response) {
            toastr.warning(getError(response.data), "Error");
        });
    }

    $scope.toggleSidePanel = function () {
        $scope.pageslideExpanded = !$scope.pageslideExpanded;
    };

    $scope.closeInfoPanel = function () {
        $scope.pageslideExpanded = false;
        $scope.openedNodeInfoPanel = undefined;
        $scope.predicates = [];
        openedLink = null;
        // o, angular, o, miracle
        $timeout(function () {
            $scope.showInfoPanel = false;
        });
    };

    function applyElementsStyleChanges(tripleNode) {
        updatePredicatesColor('predicate', 'var(--primary-color-dark)', tripleNode);
        updatePredicatesColor('predicates', 'var(--primary-color-dark)', tripleNode);

        const links = document.getElementsByClassName('link');
        if (links) {
            _.each(links, function (link) {
                const linkLink = link.__data__;
                if (linkLink.source.iri.indexOf(tripleNode.iri) >= 0 || linkLink.target.iri.indexOf(tripleNode.iri) >= 0) {
                    link.style.stroke = 'var(--primary-color-dark)';
                    link.style.strokeWidth = 4;
                }
            });
        }

        const markers = document.getElementsByClassName('arrow-marker');
        if (markers) {
            _.each(markers, function (marker) {
                const markerLink = marker.__data__;
                if (markerLink.source.iri.indexOf(tripleNode.iri) >= 0 || markerLink.target.iri.indexOf(tripleNode.iri) >= 0) {
                    marker.style.stroke = 'var(--primary-color-dark)';
                    if (!marker.__data__.target.isTriple) {
                        marker.setAttribute("refX", "23");
                    }
                }
            });
        }
    }

    $scope.clickLink = function (predData) {
        if (graph.tripleNodes.has(predData.linkId)) {
            revertElementsStyleToDefault();
            const tripleNode = graph.tripleNodes.get(predData.linkId)[predData.nodeIndex];
            // Shows selected triple and its properties
            showNodeInfo(tripleNode);
            $scope.showPredicates = true;

            const clickedEl = document.getElementById(predData.linkId + predData.nodeIndex);
            if (clickedEl) {
                clickedEl.style.fontWeight = "bold";
            }

            const nodeCopy = {};
            const tripleLinksIt = graph.tripleLinksCopy.values();
            for (let i = 0; i < graph.tripleLinksCopy.size; i++) {
                const links = tripleLinksIt.next().value;
                if (links.length > 1) {
                    links.every((link) => {
                        if (link.source.iri === tripleNode.iri) {
                            nodeCopy.iri = links[0].source.iri;
                            if (link.target.isTriple) {
                                nodeCopy.oppLinkIRI = convertTripleToLinkId(link.target.iri);
                                nodeCopy.oppTriplePred = getShortPredicate(link.target.iri.split(' ')[1]);
                            }
                            nodeCopy.pred = getShortPredicate(tripleNode.iri.split(' ')[1]);
                            if (link.predicates.length === 1) {
                                nodeCopy.linkPred = link.predicates[0];
                            }
                            return false;
                        }
                        if (link.target.iri === tripleNode.iri) {
                            nodeCopy.iri = links[0].target.iri;
                            if (link.source.isTriple) {
                                nodeCopy.oppLinkIRI = convertTripleToLinkId(link.source.iri);
                                nodeCopy.oppTriplePred = getShortPredicate(link.source.iri.split(' ')[1]);
                            }
                            nodeCopy.pred = getShortPredicate(tripleNode.iri.split(' ')[1]);
                            if (link.predicates.length === 1) {
                                nodeCopy.linkPred = link.predicates[0];
                            }
                            return false;
                        }
                        return true;
                    });
                }
            }

            if (!nodeCopy.iri) {
                nodeCopy.iri = tripleNode.iri;
                nodeCopy.pred = getShortPredicate(tripleNode.iri.split(' ')[1]);
            }

            applyElementsStyleChanges(nodeCopy);
        }
    };

    function updatePredicatesColor(className, color, tripleNode) {
        const preds = document.getElementsByClassName(className);

        if (preds) {
            _.each(preds, function (pred) {
                const predLink = pred.__data__;
                if (tripleNode) {
                    if (predLink.source.iri.indexOf(tripleNode.iri) >= 0 || predLink.target.iri.indexOf(tripleNode.iri) >= 0) {
                        pred.style.fill = color;
                    }
                    if (convertTripleToLinkId(tripleNode.iri) === convertLinkDataToLinkId(predLink)) {
                        pred.textContent = tripleNode.pred;
                        pred.style.fill = color;
                    }
                    if (tripleNode.oppLinkIRI && tripleNode.oppLinkIRI === convertLinkDataToLinkId(predLink)) {
                        pred.textContent = tripleNode.oppTriplePred;
                        pred.style.fill = color;
                    }
                } else {
                    pred.style.fill = color;
                    pred.textContent = getPredicate(predLink);
                }
            });
        }
    }

    function revertElementsStyleToDefault() {
        _.each($scope.predicates, function (pred) {
            const currEl = document.getElementById(pred.linkId + pred.nodeIndex);
            if (currEl) {
                currEl.style.fontWeight = "normal";
            }
        });
        const links = document.getElementsByClassName('link');
        if (links) {
            _.each(links, function (link) {
                link.style.stroke = '#999';
                link.style.strokeWidth = 1;
            });
        }
        updatePredicatesColor('predicate', '');
        updatePredicatesColor('predicates', '');

        const markers = document.getElementsByClassName('arrow-marker');

        if (markers) {
            _.each(markers, function (marker) {
                marker.style.stroke = '#999';
                // RefX for triple targets isn't changed, because they are not affected by increasing of stroke-width
                if (!marker.__data__.target.isTriple) {
                    marker.setAttribute("refX", "59");
                }
            });
        }
    }

    function linkActions(event, d) {
        revertElementsStyleToDefault();
        const linkId = convertLinkDataToLinkId(d);
        if (d.predicates.length === 1 && graph.tripleNodes.has(linkId)) {
            openedLink = null;
            const tripleNode = graph.tripleNodes.get(linkId)[0];
            // If there is a triple in this link, show its properties
            if (clickedNode(tripleNode, this, event.button)) {
                const nodeCopy = {};
                nodeCopy.iri = tripleNode.iri;
                nodeCopy.pred = getShortPredicate(tripleNode.iri.split(' ')[1]);
                applyElementsStyleChanges(nodeCopy);
            }
            return;
        }
        openPredicates(d);
    }

    function openPredicates(d) {
        $scope.showNodeInfo = false;
        // open predicates sidebar if they are more than one
        $scope.showPredicates = d.predicates.length > 1;
        $scope.showFilter = false;
        $scope.showInfoPanel = false;

        if (openedLink === d) {
            $scope.showNodeInfo = false;
            $scope.showInfoPanel = false;
            openedLink = null;
            return;
        }

        openedLink = d;

        if ($scope.showPredicates) {
            $scope.predicates = _.map(d.predicates, function (p) {
                const foundNodeIndex = getTripleNodeIndex(p, d);
                const isPartOfTriple = foundNodeIndex > -1;
                return {
                    value: getShortPredicate(p),
                    partOfTriple: isPartOfTriple,
                    linkId: isPartOfTriple ? convertLinkDataToLinkId(d) : '',
                    nodeIndex: foundNodeIndex
                };
            });
            $scope.showInfoPanel = true;
        }
    }

    function getTripleNode(triple) {
        const linkId = convertTripleToLinkId(triple);
        if (graph.tripleNodes.has(linkId)) {
            return graph.tripleNodes.get(linkId).find((el) => el.iri === triple);
        }
    }

    function getTripleNodeIndex(pred, d) {
        const linkId = convertLinkDataToLinkId(d);
        if (graph.tripleNodes.has(linkId)) {
            return graph.tripleNodes.get(linkId).findIndex((el) => el.iri.indexOf(pred) >= 0);
        } else {
            return -1;
        }
    }

    // get each predicate and check if there are more than one for same source and target
    function getPredicate(d) {
        if (d.predicates.length > 1) {
            return d.predicates.length + " predicates";
        }
        return getShortPredicate(d.predicates[0]);
    }

    function getShortPredicate(p) {
        const shortIRI = $scope.replaceIRIWithPrefix(p);
        if (shortIRI.length === p.length) {
            return p.split('/')[p.split('/').length - 1];
        } else {
            return shortIRI;
        }
    }

    // calculate predicate text length so we can have dynamic link lengths
    function getPredicateTextLength(link) {
        const span = $('<span></span>');
        const splitedLink = link.predicates[0].split('/');
        const predicateText = splitedLink[splitedLink.length - 1];
        span.addClass('predicate-text').text(predicateText);
        $('body').append(span);
        const textLength = span.width() + link.source.size * 2 + link.target.size * 2 + 50;
        span.remove();
        return textLength * 0.75;
    }

    $scope.splitPredicate = function (predicate) {
        return predicate.split('/')[predicate.split('/').length - 1];
    };

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.isLoadingLocation = function () {
        return $repositories.isLoadingLocation();
    };

    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.rotate = function (isLeft) {
        removeMenuIfVisible();

        // compute common rotation math such as the angle, its sine and cosine and the pivot point
        const theta = (isLeft ? 1 : -1) * 10 * Math.PI / 180; // + rotates left, - rotates right
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const pivotX = width / 2; // i.e. centre of viewport
        const pivotY = height / 2;

        // rotates each node around the pivot
        d3.selectAll(".node-wrapper")
            .each(function (d) {
                d.x = pivotX + (cos * (d.x - pivotX) + sin * (d.y - pivotY));
                d.y = pivotY + (-sin * (d.x - pivotX) + cos * (d.y - pivotY));
                if (d.fixed) {
                    // Fixed nodes need their px and py updated too
                    d.fx = d.x;
                    d.fy = d.y;
                }
            });

        force.alpha(1).restart();
    };

    $scope.openUri = function (uri, noHistory) {
        if (!noHistory) {
            const searchParams = {};
            if ($scope.configLoaded.id !== $scope.defaultGraphConfig.id) {
                searchParams.config = $scope.configLoaded.id;
            }
            searchParams.uri = uri;
            pushHistory(searchParams, {uri: uri, config: $scope.configLoaded});
        }
        $scope.$broadcast("onRootNodeChange", uri);
    };

    function saveGraphHttp(graph) {
        if ($scope.configLoaded) {
            graph.config = $scope.configLoaded.id;
        }
        SavedGraphsRestService.addNewSavedGraph(graph)
            .success(function (data, status, headers) {
                $scope.lastSavedGraphName = graph.name;
                $scope.lastSavedGraphId = headers()['x-saved-graph-id'];
                $scope.shared = graph.shared;
                $scope.refreshSavedGraphs();
                toastr.success($translate.instant('graphexplore.saved.graph', {name: graph.name}));
            })
            .error(function (data, status) {
                if (status === 422) {
                    $scope.saveGraphModal('new', graph, true);
                } else {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('graphexplore.error.cannot.create.graph'));
                }
            });
    }

    $scope.saveOrUpdateGraph = function () {
        const data = JSON.stringify(graph.copyState());
        const graphToSave = {
            id: $scope.lastSavedGraphId,
            name: $scope.lastSavedGraphName,
            data: data,
            shared: $scope.shared
        };

        if (graphToSave.id) {
            $scope.saveGraphModal('update', graphToSave);
        } else {
            $scope.saveGraphModal('new', graphToSave);
        }
    };

    $scope.renameSavedGraph = function (graphToRename) {
        // By not sending the 'data' part of a graph we only change the name
        $scope.saveGraphModal('rename', {
            id: graphToRename.id,
            name: graphToRename.name,
            config: graphToRename.config,
            shared: graphToRename.shared
        });
    };

    const editSavedGraphHttp = function (savedGraph) {
        SavedGraphsRestService.editSavedGraph(savedGraph)
            .success(function () {
                $scope.lastSavedGraphName = savedGraph.name;
                $scope.shared = savedGraph.shared;
                $scope.refreshSavedGraphs();
                toastr.success($translate.instant('graphexplore.saved.graph.was.edited', {name: savedGraph.name}));
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('graphexplore.error.cannot.edit'));
            });
    };

    $scope.saveGraphModal = function (mode, graphToSave, graphExists) {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/graphexplore/templates/modal/save-graph.html',
            controller: 'SaveGraphModalCtrl',
            resolve: {
                data: function () {
                    return {
                        mode: mode,
                        graph: graphToSave,
                        graphExists: graphExists,
                        shared: graphToSave.shared
                    };
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.restart) {
                $scope.saveGraphModal(data.mode, data.graph, false);
                return;
            }
            switch (data.mode) {
                case 'new':
                    saveGraphHttp(data.graph);
                    break;
                case 'update':
                    editSavedGraphHttp(data.graph);
                    break;
                case 'rename':
                    editSavedGraphHttp(data.graph);
                    break;
            }
        });
    };

    $scope.refreshSavedGraphs = function () {
        SavedGraphsRestService.getSavedGraphs()
            .success(function (data) {
                $scope.savedGraphs = data;
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('graphexplore.error.getting.saved.graphs'));
            });
    };


    $scope.loadSavedGraph = function (graphToLoad, noHistory) {
        if (graphToLoad.owner) {
            // Own saved graph
            $scope.lastSavedGraphName = graphToLoad.name;
            $scope.lastSavedGraphId = graphToLoad.id;
            $scope.shared = graphToLoad.shared;
            $scope.configLoaded = $scope.findConfigById(graphToLoad.config);
        } else {
            // Someone else's saved graph
            $scope.lastSavedGraphName = null;
            $scope.lastSavedGraphId = null;
            $scope.shared = graphToLoad.shared;
        }

        if (!$scope.configLoaded) {
            // Fallback to default config, either because config is gone or because graph isn't owned
            $scope.configLoaded = $scope.defaultGraphConfig;
        }

        $location.url("?saved=" + graphToLoad.id);
        graph.restoreState(JSON.parse(graphToLoad.data));
        if (!noHistory) {
            pushHistory({saved: graphToLoad.id}, {savedGraph: graphToLoad});
        }
    };

    $scope.copyToClipboardSavedGraph = function (savedGraph) {
        const url = [location.protocol, '//', location.host, location.pathname, '?saved=', savedGraph.id].join('');
        $scope.copyToClipboard(url);
    };

    function deleteSavedGraphHttp(savedGraph) {
        SavedGraphsRestService.deleteSavedGraph(savedGraph)
            .success(function () {
                $scope.refreshSavedGraphs();
                toastr.success($translate.instant('graphexplore.saved.graph.was.deleted', {name: savedGraph.name}));
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('graphexplore.error.cannot.delete'));
            });
    }

    $scope.deleteSavedGraph = function (savedGraph) {
        ModalService.openSimpleModal({
            title: $translate.instant('common.confirm'),
            message: $translate.instant('graphexplore.confirm.delete.graph', {graphName: savedGraph.name}),
            warning: true
        }).result
            .then(function () {
                deleteSavedGraphHttp(savedGraph);
            });
    };

    $scope.openIRI = function (link, event) {
        if (event.shiftKey) {
            $scope.$broadcast("onRootNodeChange", link);
        } else {
            window.open(link, '_blank');
        }
        return false;
    };

    $scope.togglePinAllNodes = function () {
        removeMenuIfVisible();

        const value = angular.isUndefined($scope.numberOfPinnedNodes) || $scope.numberOfPinnedNodes <= 0;

        $scope.numberOfPinnedNodes = 0;
        d3.selectAll('.node').each(function (d) {
            d.fixed = value;
            if (value) {
                $scope.numberOfPinnedNodes++;
                d.fx = d.x;
                d.fy = d.y;
            } else {
                d.fx = null;
                d.fy = null;
            }
        });

        force.alpha(1).restart();
    };

    // event for capturing left and right arrows used for rotation
    $('body').on("keydown", function (event) {

        if (GuidesService.isActive() || event.target.nodeName === 'input' || !$scope.nodeSelected) {
            // don't do anything when the target is an input field or no node is selected or a guide is active.
            return;
        }

        if (event.keyCode === 37) {
            // left arrow rotates left
            $scope.rotate(true);
        } else if (event.keyCode === 39) {
            // right arrow rotates right
            $scope.rotate(false);
        }
    });

    $scope.getLiteralFromPropValue = function (value) {
        return value.substring(value.indexOf(':') + 1);
    };
}

SaveGraphModalCtrl.$inject = ['$scope', '$uibModalInstance', 'data', '$translate'];

function SaveGraphModalCtrl($scope, $uibModalInstance, data, $translate) {
    $scope.mode = data.mode;
    $scope.graph = _.cloneDeep(data.graph);
    $scope.graphExists = data.graphExists;

    switch ($scope.mode) {
        case 'new':
            $scope.title = $translate.instant('graphexplore.create.new.graph');
            $scope.okButtonText = $translate.instant('common.create.btn');
            break;
        case 'update':
            $scope.title = $translate.instant('graphexplore.update');
            $scope.okButtonText = $translate.instant('common.save.btn');
            break;
        case 'rename':
            $scope.title = $translate.instant('graphexplore.rename');
            $scope.okButtonText = $translate.instant('common.save.btn');
    }

    $scope.ok = function () {
        if ($scope.form.$valid) {
            $uibModalInstance.close({graph: $scope.graph, mode: $scope.mode});
        }
    };

    $scope.saveNew = function () {
        $scope.graph.name = $scope.graph.name + ' (new)';
        $uibModalInstance.close({graph: $scope.graph, mode: 'new', restart: true});
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
