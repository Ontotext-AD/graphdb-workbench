import 'angular/utils/local-storage-adapter';
import {NumberUtils} from "../../utils/number-utils";

const modules = [
    'pageslide-directive',
    'ngAnimate',
    'ui.scroll.jqlite',
    'ui.scroll',
    'angucomplete-alt',
    'rzSlider',
    'toastr',
    'graphdb.framework.utils.localstorageadapter'
];

const SAFARI_IE_EDGE_CLASS_LIMIT = 400;
const FIREFOX_CLASS_LIMIT = 50;
const CLASS_COUNT_THRESHOLD = 1500;
const CLASS_COUNT_THRESHOLD_IE = 25;

angular
    .module('graphdb.framework.graphexplore.controllers.class', modules)
    .controller('RdfClassHierarchyCtlr', RdfClassHierarchyCtlr);

RdfClassHierarchyCtlr.$inject = ["$scope", "$rootScope", "$location", "$repositories", "$licenseService", "$window", "toastr", "GraphDataRestService", "UiScrollService", "RdfsLabelCommentService", "$timeout", "ModalService", "bowser", "LocalStorageAdapter", "LSKeys", "RDF4JRepositoriesRestService", "$translate"];

function RdfClassHierarchyCtlr($scope, $rootScope, $location, $repositories, $licenseService, $window, toastr, GraphDataRestService, UiScrollService, RdfsLabelCommentService, $timeout, ModalService, bowser, LocalStorageAdapter, LSKeys, RDF4JRepositoriesRestService, $translate) {

    /**
     * Defines the maximum number of graphs to be loaded in the view.
     *
     * The view becomes too heavy when displaying all graphs, which can impact performance.
     * This constant limits the number of graphs that will be loaded to ensure smooth rendering.
     */
    const MAX_LOADED_GRAPHS = 1000;
    $scope.hasMoreGraphs = false;
    $scope.classHierarchyData = {};
    $scope.instancesObj = {};
    $scope.instancesQueryObj = {};

    $scope.instancesObj.items = [];
    $scope.instancesNotFiltered = [];
    $scope.isWarningShowed = false;

    // Handle pageslide directive callbacks which incidentally appeared to be present in the angular's
    // scope, so we need to define our's and pass them to pageslide, otherwise it throws an error.
    $scope.onopen = $scope.onclose = () => angular.noop();

    $scope.currentBrowserLimit = 2000;
    if (bowser.firefox) {
        $scope.currentBrowserLimit = FIREFOX_CLASS_LIMIT;
    } else if (bowser.safari || bowser.msie || bowser.msedge) {
        $scope.currentBrowserLimit = SAFARI_IE_EDGE_CLASS_LIMIT;
    }

    $scope.graphsDropdownToggled = (isOpen) => {
        if ($scope.hasMoreGraphs && isOpen) {
            toastr.warning($translate.instant('dependencies.graphs.too.many.warning', {graphsLimit: NumberUtils.formatNumberToLocaleString(MAX_LOADED_GRAPHS, $translate.use())}))
        }
    }

    // creating datasource for class instances data
    const datasource = {};
    let position = 0;
    let current = 0;
    $rootScope.key = "";
    datasource.get = function (index, count, success) {
        return UiScrollService.initLazyList(index, count, success, position, $scope.instancesObj.items);
    };

    //allGraphs is used to include all graphs in the chosen repository and represent the Class Hierarchy diagram,
    // while graphsInRepo is sliced to 1000 if there are more than 1000 graphs in the repository, and they are present
    // in the drop-down menu otherwise browsers crash.
    let selectedGraph = allGraphs;

    const initView = function () {
        if (!$scope.getActiveRepository()) {
            return;
        }
        // Try to load one more file than the maximum limit.
        // This allows us to check if there is at least one additional file beyond the set max limit.
        return RDF4JRepositoriesRestService.resolveGraphs($repositories.getActiveRepository(),MAX_LOADED_GRAPHS + 1)
            .success(function (graphsInRepo) {
                $scope.graphsInRepo = graphsInRepo.results.bindings;
                // Determines if there are more files than the specified limit.
                // We increase the limit in the check because:
                // - One extra file is added before the request is sent.
                // - Another file (the default graph) is added by the service when the response is received.
                $scope.hasMoreGraphs = $scope.graphsInRepo.length > MAX_LOADED_GRAPHS + 2;
                setSelectedGraphFromCache();
            }).error(function (data) {
            $scope.repositoryError = getError(data);
            toastr.error(getError(data), $translate.instant('graphexplore.error.getting.graphs'));
        });
    };

    const setSelectedGraphFromCache = function () {
        const selGraphFromCache = LocalStorageAdapter.get(`classHierarchy-selectedGraph-${$repositories.getActiveRepository()}`);
        if (selGraphFromCache !== null && $scope.graphsInRepo.some(graph => graph.contextID.uri === selGraphFromCache.contextID.uri)) {
            selectedGraph = selGraphFromCache;
        } else {
            LocalStorageAdapter.set(`classHierarchy-selectedGraph-${$repositories.getActiveRepository()}`, selectedGraph);
        }
    };

    const getPlaceholderText = function () {
        return $scope.instancesObj.items.length < 1000 ?
            $translate.instant('graphexplore.search.class.instances') :
            $translate.instant('graphexplore.search.first.class.instances');
    };

    $rootScope.$watch(function () {
        return $rootScope.key;
    }, function () {
        position = 0;
        _.each($scope.instancesObj.items, function (item) {
            if ($rootScope.key > item) position++;
        });
        current++;
    });

    datasource.revision = function () {
        return current;
    };
    // adapter implementation for ui-scroll directive
    $scope.adapterContainer = {adapter: {remain: true}};

    const subscriptions = [];

    // events
    subscriptions.push($scope.$on('goToDomainRangeGraphView', onGoToDomainRangeGraphView));
    subscriptions.push($scope.$on('classCount', initClassCountSlider));
    subscriptions.push($scope.$on('repositoryIsSet', onRepositoryIsSet));
    subscriptions.push($rootScope.$on('$translateChangeSuccess', () => {
        $scope.instancesSearchPlaceholder = getPlaceholderText();
    }));

    const unsubscribeListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    subscriptions.push($scope.$on('$destroy', unsubscribeListeners));
    // objects
    $scope.datasource = datasource;

    // functions
    $scope.goToDomainRangeGraphView = goToDomainRangeGraphView;
    $scope.toggleClassInfoSidePanel = toggleClassInfoSidePanel;
    $scope.toggleHidePrefixes = toggleHidePrefixes;
    $scope.getActiveRepositoryNoError = getActiveRepositoryNoError;
    $scope.isSystemRepository = isSystemRepository;
    $scope.confirmReloadClassHierarchy = confirmReloadClassHierarchy;
    $scope.focusOnRoot = focusOnRoot;
    $scope.copyToClipboard = copyToClipboard;

    $scope.searchedClassCallback = searchedClassCallback;

    $scope.instancesQueryObj.query = "";
    $scope.instancesFilterFunc = instancesFilterFunc;

    initView();

    $scope.$watch('instancesObj.items', function () {
        if ($scope.instancesObj.items.length > 0) {
            $timeout(function () {
                $scope.adapterContainer.adapter.reload();
            }, 30);
        }
    });

    $scope.$watch('selectedClass', function () {
        if ($scope.showClassInfoPanel) {
            prepareDataForClassInfoSidePanel($scope.selectedClass);
        }
    });

    $scope.goToResourceView = () => {
        $location.path("sparql").search($scope.resourceViewInstancesUriParameters);
    }

    function instancesFilterFunc(inst) {
        return inst.resolvedUri
            .toLowerCase()
            .indexOf($scope.instancesQueryObj.query.toLowerCase()) >= 0;
    }

    function searchedClassCallback(selected) {
        if (selected) {
            const searchedClass = {name: selected.title};
            $rootScope.$broadcast('searchedClass', searchedClass);
        }
    }

    function initClassCountSlider(event, classCount, currentSliderValue) {
        if ($scope.classCountSlider.options && $scope.classCountSlider.options.ceil !== classCount) {
            // Force reset of the slider if it exists and its class count (ceil) is different from
            // the broadcast class count.
            $scope.classCountSlider = {};
        }

        const showBrowserCompatibleClassLimitWarning = function (classLimit) {
            if (bowser.chrome) {
                toastr.warning($translate.instant('graphexplore.disabling.animations', {classLimit: classLimit}),
                    $translate.instant('graphexplore.reducing.visual.effects'));
            } else {
                toastr.warning($translate.instant('graphexplore.browser.performance', {browser: bowser.name, classLimit: classLimit}),
                    $translate.instant('graphexplore.reducing.visual.effects'));
            }
        };

        if (!$scope.classCountSlider.value) {
            $scope.showExternalElements = true;
            $scope.classCountSlider = {
                value: classCount,
                options: {
                    floor: 1,
                    ceil: classCount,
                    vertical: true,
                    showSelectionBar: true,
                    onChange: function () {
                        $timeout(setNewCurrentSliderValue, 100, true);
                    }
                }
            };

            if (LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_CURRENT_SLIDER_VALUE) === null) {
                if (classCount > $scope.currentBrowserLimit) {
                    showBrowserCompatibleClassLimitWarning($scope.currentBrowserLimit);
                }
            }
        }

        const s = LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_SWITCH_PREFIXES);
        const noSwitchPrefixes = (s != null) && (s !== "true");
        if (noSwitchPrefixes) {
            $scope.showExternalElements = true;
        }

        if (currentSliderValue) {
            $scope.classCountSlider.value = currentSliderValue;
        } else if (classCount >= CLASS_COUNT_THRESHOLD) {
            $scope.classCountSlider.value = CLASS_COUNT_THRESHOLD;
            toastr.warning($translate.instant('graphexplore.class.count.slider', {count: CLASS_COUNT_THRESHOLD}), $translate.instant('graphexplore.reducing.class.count'));
        }

        if (classCount >= CLASS_COUNT_THRESHOLD_IE && (!(window.ActiveXObject) && "ActiveXObject" in window) && !$scope.isWarningShowed) {
            $scope.classCountSlider.value = CLASS_COUNT_THRESHOLD_IE;
            $scope.isWarningShowed = true;
            toastr.warning($translate.instant('graphexplore.class.count.browser', {count: CLASS_COUNT_THRESHOLD_IE}), $translate.instant('graphexplore.reducing.class.count'));
        }

        $timeout(function () {
            $scope.$broadcast('reCalcViewDimensions');

            const sliderElement = document.getElementById('rzslider');
            let lastTimeWheel = 0;

            sliderElement.addEventListener('wheel', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // at least 100ms must have passed since last time we updated
                const now = new Date().getTime();
                if (now - lastTimeWheel > 100) {
                    lastTimeWheel = now;
                } else {
                    return;
                }

                let newValue = $scope.classCountSlider.value;
                const stepSize = $scope.classCountSlider.options.step || 1;
                if (e.deltaY <= -1) {
                    newValue += stepSize;
                } else if (e.deltaY >= 1) {
                    newValue -= stepSize;
                }

                newValue = Math.max($scope.classCountSlider.options.floor, Math.min($scope.classCountSlider.options.ceil, newValue));

                if (newValue !== $scope.classCountSlider.value) {
                    $scope.$apply(function () {
                        $scope.classCountSlider.value = newValue;
                        $timeout(setNewCurrentSliderValue, 100, true);
                    });
                }
            });
        }, 200);

        setNewCurrentSliderValue();
    }

    function setNewCurrentSliderValue() {
        $scope.currentSliderValue = $scope.classCountSlider.value;
    }

    function goToDomainRangeGraphView(selectedClass) {
        const uri = selectedClass.data.fullName;
        const name = selectedClass.data.name;

        GraphDataRestService.checkDomainRangeData(uri)
            .success(function (response, status) {
                if (status === 204) {
                    toastr.warning($translate.instant('graphexplore.no.domain.range', {name: name}));
                } else {
                    LocalStorageAdapter.set(LSKeys.CLASS_HIERARCHY_LAST_SELECTED_CLASS, $location.hash());
                    $location
                        .hash("")
                        .path("domain-range-graph")
                        .search("uri", uri)
                        .search("name", name);
                }
            }).error(function () {
                toastr.error($translate.instant('graphexplore.error.request.failed', {name: name}));
            });
    }

    function onGoToDomainRangeGraphView(event, selectedClass) {
        goToDomainRangeGraphView(selectedClass);
    }

    function copyToClipboard(uri) {
        ModalService.openCopyToClipboardModal(uri);
    }

    function prepareDataForClassInfoSidePanel(selectedClass) {
        // generate SPARQL query for listing class instances in sparql view
        const uri = selectedClass.data.fullName;
        let name = selectedClass.data.name;

        // in case of no prefix available both name and uri are the same
        // so only take the local name of the uri a tab name for the SPARQL view
        if (name === uri) {
            const localNameStartIdx = name.lastIndexOf("#");
            name = name.substring(localNameStartIdx + 1);
        }
        $scope.encodedUri = encodeURIComponent(uri);

        const query = "prefix onto:<http://www.ontotext.com/>\nselect ?s {\n    ?s a <" + uri + "> .\n}";

        // Prepare parameters for redirecting to sparql view, opening a new tab, writing the generated query and executing it
        $scope.resourceViewInstancesUriParameters = {
            name,
            infer: true,
            sameAs: false,
            query,
            execute: true
        }

        GraphDataRestService.getRdfsLabelAndComment(uri)
            .success(function (response) {
                $scope.rdfsLabel = response.label;
                $scope.rdfsComment = response.comment;
                $scope.expanded = false;
            })
            .error(function () {
                toastr.error("Error getting rdfs:label and rdfs:comment");
            });

        // clear instances search input field when changing classes
        $scope.instancesQueryObj.query = '';

        // get class instances for selected rdf class
        $scope.instancesLoader = true;
        GraphDataRestService.getClassInstances(uri)
            .success(function (response) {
                $scope.instancesObj.items = [];
                _.each(response, function (value, key) {
                    const obj = {};
                    // TODO extract in core function isTriple(str)
                    obj.type = (value.startsWith("<<") && value.endsWith(">>")) ? "triple": "uri";
                    obj.absUri = encodeURIComponent(value);
                    obj.absUriNonEncoded = value;
                    obj.resolvedUri = key;
                    $scope.instancesObj.items.push(obj);
                });
                $scope.instancesLoader = false;

                $scope.instancesSearchPlaceholder = getPlaceholderText();
                $scope.instancesNotFiltered = $scope.instancesObj.items;
            })
            .error(function () {
                toastr.error($translate.instant('graphexplore.error.instances.request'));
            });

    }

    function toggleClassInfoSidePanel() {
        $scope.showClassInfoPanel = !$scope.showClassInfoPanel;
        $rootScope.$broadcast('sidePanelClosed');
    }

    function toggleHidePrefixes() {
        $scope.hidePrefixes = !$scope.hidePrefixes;
    }

    function getActiveRepositoryNoError() {
        if (!$scope.repositoryError) {
            return $repositories.getActiveRepository();
        }
    }

    function isSystemRepository() {
        return $repositories.isSystemRepository();
    }

    // Hack needed to force hide prefix toggle tooltip in order not be
    // visible after icon is switched
    $(document).ready(function () {
        $(".prefix-toggle").click(function () {
            $(".tooltip").hide();
        });
    });

    function focusOnRoot() {
        $scope.$broadcast("rootFocus");
    }

    function refreshDiagramExternalElements() {
        $location.replace().hash("1");

        // clear old instances data from previous repository
        $scope.instancesObj.items = [];

        // delete old instance count slider and reinit with classes count values
        // appropriate for the newly activated repository
        $scope.showExternalElements = false;

        $scope.showClassInfoPanel = false;

        LocalStorageAdapter.clearClassHieararchyState();

        // reset all watched scope variables to undefined in order to stop unwanted triggering of watches
        $scope.hidePrefixes = LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_HIDE_PREFIXES) === "true";
        $scope.currentSliderValue = undefined;
        $scope.classHierarchyData = {};

        // clear class search input field
        $rootScope.$broadcast('angucomplete-alt:clearInput');
    }

    function fixToolbar() {
        // For some reason angular behaves weirdly with the toolbar and its ng-show. Even though the condition
        // is updated, angular won't remove the ng-hide class and the toolbar will stay hidden.
        // Calling $apply(), $digest() or whatever doesn't help either so we have to resort to this instead.
        // The problem is easy to reproduce when viewing a deeper class and changing the repository.
        if ($scope.hasClassHierarchy()) {
            $timeout(function () {
                $('#toolbar').removeClass('ng-hide');
            }, 0);
        }
    }

    function reloadClassHierarchy() {
        refreshDiagramExternalElements();
        $scope.loader = true;
        $scope.hierarchyError = false;
        GraphDataRestService.reloadClassHierarchy(selectedGraph.contextID.uri)
            .success(function (response) {
                $scope.loader = false;
                $scope.classHierarchyData = response;
                fixToolbar();
                initClassCountSlider();
            })
            .error(function (response) {
                $scope.loader = false;
                $scope.hierarchyError = getError(response);
                toastr.error(getError(response), $translate.instant('graphexplore.error.rdf.class.request'));
            });
    }

    function confirmReloadClassHierarchy() {
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.operation'),
            message: $translate.instant('graphexplore.calculating.hierarchy'),
            warning: true
        }).result
            .then(function () {
                reloadClassHierarchy();
            });
    }

    let currentActiveRepository = $repositories.getActiveRepository();
    function onRepositoryIsSet() {
        if (!$licenseService.isLicenseValid()) {
            return;
        }
        if (currentActiveRepository === $repositories.getActiveRepository()) {
            return;
        } else {
            currentActiveRepository = $repositories.getActiveRepository();
        }
        $scope.repositoryError = null;
        if (!currentActiveRepository) {
            return;
        }
        selectedGraph = allGraphs;
        initView()
            .then(getClassHierarchyData);
    }

    function getClassHierarchyData() {

        refreshDiagramExternalElements();

        if (!$scope.isSystemRepository() && $scope.isLicenseValid()) {
            $scope.hierarchyError = false;
            $scope.loader = true;
            GraphDataRestService.getClassHierarchyData(selectedGraph.contextID.uri)
                .success(function (response, status) {
                    $scope.showExternalElements = true;
                    $scope.loader = false;
                    $scope.classHierarchyData = response;
                    if (status === 207) {
                        toastr.warning($translate.instant('graphexplore.update.diagram'), $translate.instant('graphexplore.repository.data.changed'));
                    }
                    fixToolbar();
                }).error(function (response) {
                $scope.loader = false;
                $scope.hierarchyError = getError(response);
                toastr.error(getError(response), $translate.instant('graphexplore.error.rdf.class.request'));
            });
        }
    }

    $scope.hasClassHierarchy = function () {
        return $scope.classHierarchyData.classCount && $scope.getActiveRepositoryNoError() && !$scope.isSystemRepository();
    };

    $scope.isLicenseValid = function () {
        return $licenseService.isLicenseValid();
    };


    $scope.chosenGraph = function (graph) {
        selectedGraph = graph;
        getClassHierarchyData();
        LocalStorageAdapter.set(`classHierarchy-selectedGraph-${$repositories.getActiveRepository()}`, selectedGraph);
    };

    $scope.getSelGraphValue = function () {
        return selectedGraph.contextID.value;
    };

    $scope.isAllGraphsSelected = function () {
        return $scope.getSelGraphValue() === 'all.graphs.label';
    };
}
