const modules = [
    'pageslide-directive',
    'ngAnimate',
    'ui.scroll.jqlite',
    'ui.scroll',
    'angucomplete-alt',
    'rzSlider',
    'toastr'
];

angular
    .module('graphdb.framework.graphexplore.controllers.class', modules)
    .controller('RdfClassHierarchyCtlr', RdfClassHierarchyCtlr)
    .constant("SAFARI_IE_EDGE_CLASS_LIMIT", 400)
    .constant("FIREFOX_CLASS_LIMIT", 50)
    .constant("CLASS_COUNT_THRESHOLD", 1500)
    .constant("CLASS_COUNT_THRESHOLD_IE", 25);

RdfClassHierarchyCtlr.$inject = ["$scope", "$rootScope", "$location", "$repositories", "$window", "toastr", "GraphDataService", "UiScrollService", "RdfsLabelCommentService", "$timeout", "ModalService", "bowser", "localStorageService", "SAFARI_IE_EDGE_CLASS_LIMIT", "FIREFOX_CLASS_LIMIT", "CLASS_COUNT_THRESHOLD", "CLASS_COUNT_THRESHOLD_IE"];

function RdfClassHierarchyCtlr($scope, $rootScope, $location, $repositories, $window, toastr, GraphDataService, UiScrollService, RdfsLabelCommentService, $timeout, ModalService, bowser, localStorageService, SAFARI_IE_EDGE_CLASS_LIMIT, FIREFOX_CLASS_LIMIT, CLASS_COUNT_THRESHOLD, CLASS_COUNT_THRESHOLD_IE) {
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

    // creating datasource for class instances data
    const datasource = {};
    let position = 0;
    let current = 0;
    $rootScope.key = "";
    datasource.get = function (index, count, success) {
        return UiScrollService.initLazyList(index, count, success, position, $scope.instancesObj.items);
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


    // events
    $scope.$on('goToDomainRangeGraphView', onGoToDomainRangeGraphView);
    $scope.$on('classCount', initClassCountSlider);
    $scope.$on('repositoryIsSet', onRepositoryIsSet);

    // objects
    $scope.datasource = datasource;

    // functions
    $scope.goToDomainRangeGraphView = goToDomainRangeGraphView;
    $scope.toggleClassInfoSidePanel = toggleClassInfoSidePanel;
    $scope.getActiveRepositoryNoError = getActiveRepositoryNoError;
    $scope.isSystemRepository = isSystemRepository;
    $scope.confirmReloadClassHierarchy = confirmReloadClassHierarchy;
    $scope.focusOnRoot = focusOnRoot;
    $scope.copyToClipboard = copyToClipboard;

    $scope.searchedClassCallback = searchedClassCallback;

    $scope.instancesQueryObj.query = "";
    $scope.instancesFilterFunc = instancesFilterFunc;


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
                toastr.warning("Disabling animations for more than " + classLimit + " classes.",
                    "Reducing visual effects");
            } else {
                toastr.warning(bowser.name + " performs poorly with more than " +
                    classLimit + " classes. " +
                    "Please consider using Chrome for more optimal performance.",
                    "Reducing visual effects");
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

            if (localStorageService.get("classHierarchy-currentSliderValue") === null) {
                if (classCount > $scope.currentBrowserLimit) {
                    showBrowserCompatibleClassLimitWarning($scope.currentBrowserLimit);
                }
            }
        }

        const s = localStorageService.get("classHierarchy-switchPrefixes");
        const noSwitchPrefixes = (s != null) && (s !== "true");
        if (noSwitchPrefixes) {
            $scope.showExternalElements = true;
        }

        if (currentSliderValue) {
            $scope.classCountSlider.value = currentSliderValue;
        } else if (classCount >= CLASS_COUNT_THRESHOLD) {
            $scope.classCountSlider.value = CLASS_COUNT_THRESHOLD;
            toastr.warning("Class count is reduced to " + CLASS_COUNT_THRESHOLD + " for faster initial load. Use the slider to see all classes.", "Reducing class count");
        }

        if (classCount >= CLASS_COUNT_THRESHOLD_IE && (!(window.ActiveXObject) && "ActiveXObject" in window) && !$scope.isWarningShowed) {
            $scope.classCountSlider.value = CLASS_COUNT_THRESHOLD_IE;
            $scope.isWarningShowed = true;
            toastr.warning("Class count is reduced to " + CLASS_COUNT_THRESHOLD_IE + " for faster load in IE. If you want better performance please switch to different browser.", "Reducing class count");
        }

        $timeout(function () {
            $scope.$broadcast('reCalcViewDimensions');
        }, 200);

        // set this before the slider is moved by the user as we need it
        setNewCurrentSliderValue();

        // Modify the slider with the mouse wheel
        let lastTimeWheel = 0;
        $('rzslider').on('wheel', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // at least 100ms must have passed since last time we updated
            const now = new Date().getTime();
            if (now - lastTimeWheel > 100) {
                lastTimeWheel = now;
            } else {
                return;
            }

            e = e.originalEvent;

            let newValue = $scope.classCountSlider.value;
            if (e.deltaY <= -1) {
                newValue += 1;
            } else if (e.deltaY >= 1) {
                newValue -= 1;
            }

            if (newValue !== $scope.classCountSlider.value
                && newValue >= $scope.classCountSlider.options.floor
                && newValue <= $scope.classCountSlider.options.ceil) {
                $scope.$apply(function () {
                    $scope.classCountSlider.value = newValue;
                    $timeout(setNewCurrentSliderValue, 100, true);
                });
            }
        });
    }

    function setNewCurrentSliderValue() {
        $scope.currentSliderValue = $scope.classCountSlider.value;
    }

    function goToDomainRangeGraphView(selectedClass) {
        const uri = selectedClass.fullName;
        const name = selectedClass.name;

        GraphDataService.checkDomainRangeData(uri)
            .success(function (response, status) {
                if (status === 204) {
                    toastr.warning("No domain-range data available for '" + name + "' !");
                } else {
                    localStorageService.set("classHierarchy-lastSelectedClass", $location.hash());
                    $location
                        .hash("")
                        .path("domain-range-graph")
                        .search("uri", uri)
                        .search("name", name);
                }
            }).error(function () {
                toastr.error("Request for " + name + " failed!");
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
        const uri = selectedClass.fullName;
        let name = selectedClass.name;

        // in case of no prefix available both name and uri are the same
        // so only take the local name of the uri a tab name for the SPARQL view
        if (name === uri) {
            const localNameStartIdx = name.lastIndexOf("#");
            name = name.substring(localNameStartIdx + 1);
        }
        $scope.encodedUri = encodeURIComponent(uri);

        const query = "prefix onto:<http://www.ontotext.com/> select ?s from onto:disable-sameAs { ?s a <" + uri + "> . }";

        const encodedQuery = encodeURIComponent(query);

        // generate url for redirecting to sparql view, opening a new tab, writing the generated query and executing it
        $scope.viewInstancesUri = 'sparql?name=' + name + '&infer=true&sameAs=false&query=' + encodedQuery + '&execute=true';

        GraphDataService.getRdfsLabelAndComment(uri)
            .success(function (response) {
                // var result = RdfsLabelCommentService.processAndFilterLabelAndComment(response);
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
        GraphDataService.getClassInstances(uri)
            .success(function (response) {
                $scope.instancesObj.items = [];
                _.each(response, function (value, key) {
                    const obj = {};
                    obj.absUri = encodeURIComponent(value);
                    obj.absUriNonEncoded = value;
                    obj.resolvedUri = key;
                    $scope.instancesObj.items.push(obj);
                });
                $scope.instancesLoader = false;

                $scope.instancesSearchPlaceholder = $scope.instancesObj.items.length < 1000 ? "Search class instances" : "Search first 1000 class instances";
                $scope.instancesNotFiltered = $scope.instancesObj.items;
            })
            .error(function () {
                toastr.error("Request for class instances for  failed!");
            });

    }

    function toggleClassInfoSidePanel() {
        $scope.showClassInfoPanel = !$scope.showClassInfoPanel;
        $rootScope.$broadcast('sidePanelClosed');
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

        angular.forEach(localStorageService.keys(), function (key) {
            // remove everything but the hide prefixes setting, it should always persist
            if (key.indexOf("classHierarchy-") === 0 && key !== "classHierarchy-hidePrefixes") {
                localStorageService.remove(key);
            }
        });

        // reset all watched scope variables to undefined in order to stop unwanted triggering of watches
        $scope.hidePrefixes = localStorageService.get("classHierarchy-hidePrefixes") === "true";
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
        GraphDataService.reloadClassHierarchy()
            .success(function (response) {
                $scope.loader = false;
                $scope.classHierarchyData = response;
                fixToolbar();
                initClassCountSlider();
            })
            .error(function (response) {
                $scope.loader = false;
                $scope.hierarchyError = getError(response);
                toastr.error(getError(response), "Request for RDF Class Hierarchy failed!");
            });
    }

    function confirmReloadClassHierarchy() {
        ModalService.openSimpleModal({
            title: 'Confirm operation',
            message: 'Calculating class hierarchy data may take some time. Are you sure?',
            warning: true
        }).result
            .then(function () {
                reloadClassHierarchy();
            });
    }

    let currentActiveRepository = $repositories.getActiveRepository();

    function onRepositoryIsSet() {
        if (currentActiveRepository === $repositories.getActiveRepository()) {
            return;
        } else {
            currentActiveRepository = $repositories.getActiveRepository();
        }

        refreshDiagramExternalElements();

        if (!$scope.isSystemRepository()) {
            $scope.hierarchyError = false;
            $scope.loader = true;
            GraphDataService.getClassHierarchyData()
                .success(function (response, status) {
                    $scope.loader = false;
                    $scope.classHierarchyData = response;
                    if (status === 207) {
                        toastr.warning("You can update the diagram by pressing the reload button.", "Repository data has changed");
                    }
                    fixToolbar();
                }).error(function (response) {
                $scope.loader = false;
                $scope.hierarchyError = getError(response);
                toastr.error(getError(response), "Request for RDF Class Hierarchy failed!");
            });
        }
    }

    $scope.hasClassHierarchy = function () {
        return $scope.classHierarchyData.classCount && $scope.getActiveRepositoryNoError() && !$scope.isSystemRepository();
    };
}
