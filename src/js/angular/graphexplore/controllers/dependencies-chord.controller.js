const STATUS = {
    'WAIT': 'WAIT',
    'NO_REPO': 'NO_REPO',
    'READY': 'READY',
    'IN_PROGRESS': 'IN_PROGRESS',
    'ERROR': 'ERROR'
};

const modules = [
    'ui.scroll.jqlite',
    'ui.scroll',
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.utils.localstorageadapter'
];
const allGraphs = {
    contextID: {
        type: "all",
        value: "all.graphs.label",
        uri: ""
    }
};
Object.defineProperty(global, 'allGraphs', {
    get: () => {return allGraphs;}
});

angular
    .module('graphdb.framework.graphexplore.controllers.dependencies', modules)
    .controller('DependenciesChordCtrl', DependenciesChordCtrl)
    .config(['$uibTooltipProvider', function ($uibTooltipProvider) {
        $uibTooltipProvider.options({appendToBody: true});
    }])
    .filter('humanize', function () {
        return humanize;
    });

function humanize(number) {
    if (number < 1000) {
        return number;
    }
    const si = ['K', 'M', 'G', 'T', 'P', 'H'];
    const exp = Math.floor(Math.log(number) / Math.log(1000));
    let result = number / Math.pow(1000, exp);
    result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
    return result + si[exp - 1];
}

DependenciesChordCtrl.$inject = ['$scope', '$rootScope', '$repositories', 'toastr', '$timeout', 'GraphDataRestService', 'UiScrollService', 'ModalService', 'LocalStorageAdapter', 'RDF4JRepositoriesRestService', '$translate'];

function DependenciesChordCtrl($scope, $rootScope, $repositories, toastr, $timeout, GraphDataRestService, UiScrollService, ModalService, LocalStorageAdapter, RDF4JRepositoriesRestService, $translate) {

    let timer = null;

    $scope.status = !$repositories.getActiveRepository() ? STATUS.NO_REPO : STATUS.WAIT;

    //allGraphs is used to include all graphs in the chosen repository and represent the Class Relationships diagram and table,
    // while graphsInRepo is sliced to 1000 if there are more than 1000 graphs in the repository, and they are present
    // in the drop-down menu otherwise browsers crash.
    let selectedGraph = allGraphs;

    const initView = function () {
        RDF4JRepositoriesRestService.resolveGraphs($repositories.getActiveRepository())
            .success(function (graphsInRepo) {
                $scope.graphsInRepo = graphsInRepo.results.bindings.length > 1002 ? graphsInRepo.results.bindings.slice(0, 1002) : graphsInRepo.results.bindings;
                setSelectedGraphFromCache();
                if (!$scope.isSystemRepository()) {
                    $scope.status = 'WAIT';
                    getRelationshipsStatus(true);
                } else if ($scope.status !== "READY") {
                    getRelationshipsStatus();
                }
            }).error(function (data) {
            $scope.repositoryError = getError(data);
            toastr.error(getError(data), $translate.instant('graphexplore.error.getting.graph'));
        });
    };

    const setSelectedGraphFromCache = function () {
        const selGraphFromCache = LocalStorageAdapter.get(`dependencies-selectedGraph-${$repositories.getActiveRepository()}`);
        if (selGraphFromCache !== null && $scope.graphsInRepo.some(graph => graph.contextID.uri === selGraphFromCache.contextID.uri)) {
            selectedGraph = selGraphFromCache;
        } else {
            LocalStorageAdapter.set(`dependencies-selectedGraph-${$repositories.getActiveRepository()}`, selectedGraph);
        }
    };

    const getRelationshipsData = function (selectedClasses) {
        d3.select('#dependencies-chord').html('');

        $scope.status = STATUS.WAIT;

        GraphDataRestService.getRelationshipsData(selectedClasses, $scope.direction, selectedGraph.contextID.uri)
            .success(function (matrixData) {
                // Check classes empty
                $scope.dependenciesData = {
                    matrix: matrixData.right,
                    nodes: matrixData.left,
                    hasLinks: _.sum(_.map(matrixData.right, function (arr) {
                        return _.sum(arr);
                    })) > 0,
                    direction: $scope.direction
                };
                $scope.status = STATUS.READY;
            }).error(function (data) {
            $scope.status = STATUS.READY;
            toastr.error(getError(data), $translate.instant('graphexplore.error.dependencies.count'));
        });
    };

    const getRelationshipsClasses = function () {
        GraphDataRestService.getRelationshipsClasses($scope.direction, selectedGraph.contextID.uri)
            .success(function (classesData, status) {
                $scope.allClasses.items = _.filter(classesData, classFilterFunc);
                $scope.allNotFilteredClasses = classesData;
                $scope.selectedClasses = undefined;
                if (angular.isUndefined($scope.selectedClasses)) {
                    $scope.selectedClasses = classesData.slice(0, 10);
                }
                getRelationshipsData($scope.selectedClasses);
                if (status === 207) {
                    toastr.warning($translate.instant('graphexplore.update.diagram'), $translate.instant('graphexplore.repository.data.changed'));
                }
            });
    };

    const getRelationshipsStatus = function (force) {
        if ($scope.status === STATUS.READY && !force) {
            return;
        }
        $scope.status = STATUS.WAIT;
        GraphDataRestService.getRelationshipsStatus(selectedGraph.contextID.uri)
            .success(function (data) {
                $scope.status = data;
                if ($scope.status === STATUS.IN_PROGRESS) {
                    if (timer !== null) {
                        return;
                    } else {
                        timer = $timeout(getRelationshipsStatus, 2000);
                    }
                }
                if ($scope.status === STATUS.READY) {
                    if (timer !== null) {
                        $timeout.cancel(timer);
                        timer = null;
                    }
                    getRelationshipsClasses();
                }
                if ($scope.status.indexOf('ERROR;') === 0) {
                    $scope.status = STATUS.ERROR;
                    toastr.error($translate.instant('graphexplore.error.dependencies.calc', {error:$scope.status.substring('ERROR;'.length)}));
                }
            })
            .error(function (data) {
                $scope.status = STATUS.ERROR;
                toastr.error(getError(data), $translate.instant('graphexplore.error.dependencies.count.status'));
            });
    };

    $scope.allClasses = {};
    $scope.allClasses.items = [];
    $scope.allNotFilteredClasses = [];
    $scope.direction = 'all';

    const datasource = {};
    let position = 0;
    let current = 0;
    $rootScope.key = '';

    datasource.get = function (index, count, success) {
        UiScrollService.initLazyList(index, count, success, position, $scope.allClasses.items);
    };

    $rootScope.$watch(function () {
        return $rootScope.key;
    }, function () {
        position = 0;
        _.each($scope.allClasses.items, function (item) {
            if ($rootScope.key > item) position++;
        });
        current++;
    });

    datasource.revision = function () {
        return current;
    };

    $scope.datasource = datasource;

    // adapter implementation for ui-scroll directive
    // reload
    $scope.adapterContainer = {adapter: {remain: true}};

    $scope.classQuery = {};
    $scope.classQuery.query = '';
    $scope.classFilterFunc = classFilterFunc;

    function classFilterFunc(c) {
        return c.name
            .toLowerCase()
            .indexOf($scope.classQuery.query.toLowerCase()) !== -1;
    }

    $scope.$watch('allClasses.items', function () {
        if ($scope.allClasses.items.length > 0) {
            $timeout(function () {
                $scope.adapterContainer.adapter.reload();
            }, 30);
        }
    });

    $scope.$watch('direction', function () {
        if (!$repositories.getActiveRepository() ||
                $scope.isSystemRepository() || $repositories.isActiveRepoFedXType()) {
            return;
        }
        initView();
    });

    $scope.$on('$destroy', function () {
        $timeout.cancel(timer);
    });

    $scope.isLoading = function () {
        return $scope.status === STATUS.IN_PROGRESS || $scope.status === STATUS.WAIT;
    };

    $scope.confirmCalculateDependencies = function () {
        ModalService.openSimpleModal({
            title: $translate.instant('confirm.operation'),
            message: $translate.instant('graphexplore.calculating.relationships'),
            warning: true
        }).result
            .then(function () {
                $scope.calculateDependencies();
            });
    };

    $scope.calculateDependencies = function () {
        $scope.status = STATUS.WAIT;
        $scope.selectedClasses = undefined;
        GraphDataRestService.calculateRelationships(selectedGraph.contextID.uri)
            .success(function (data) {
                if (data.indexOf('ERROR;') === 0) {
                    toastr.error($translate.instant('graphexplore.error.dependencies.calc', {error:$scope.status.substring('ERROR;'.length)}));
                } else {
                    getRelationshipsStatus();
                }
            })
            .error(function (data) {
                toastr.error($translate.instant('graphexplore.error.could.not.force.count', {error: getError(data)}));
            });
    };

    $scope.addClass = function (clazz) {
        $scope.selectedClasses.push(clazz);
        getRelationshipsData($scope.selectedClasses);
    };

    $scope.removeClass = function (clazz) {
        _.remove($scope.selectedClasses, function (c) {
            return c.name === clazz.name;
        });
        getRelationshipsData($scope.selectedClasses);
    };

    $scope.showClass = function (clazz) {
        $scope.classToShow = clazz;
    };

    $scope.isClassByNameShown = function (name) {
        return _.find($scope.selectedClasses, {name: name}) !== undefined;
    };

    $scope.addClassByName = function (name) {
        $scope.selectedClasses.push(_.find($scope.allClasses.items, {name: name}));
        getRelationshipsData($scope.selectedClasses);
    };

    $scope.removeClassByName = function (name) {
        _.remove($scope.selectedClasses, function (c) {
            return c.name === name;
        });
        getRelationshipsData($scope.selectedClasses);
    };


    $scope.removeAllClasses = function () {
        $scope.selectedClasses = [];
        getRelationshipsData($scope.selectedClasses);
    };

    $scope.isSystemRepository = function () {
        return $repositories.getActiveRepository() === 'SYSTEM';
    };

    function onRepositoryIsSet() {
        // clear class search on changing the repository
        $scope.classQuery = {};
        $scope.classQuery.query = '';
        $scope.repositoryError = null;
        selectedGraph = allGraphs;
        if (!$repositories.getActiveRepository() || $repositories.isActiveRepoFedXType()) {
            $scope.status = STATUS.NO_REPO;
            return;
        }
        initView();
    }

    const repoIsSetListener = $scope.$on('repositoryIsSet', onRepositoryIsSet);

    window.addEventListener('beforeunload', removeRepoIsSetListener);

    function removeRepoIsSetListener() {
        repoIsSetListener();
        window.removeEventListener('beforeunload', removeRepoIsSetListener);
    }

    $scope.selectGraph = function (graph) {
        selectedGraph = graph;
        getRelationshipsStatus(true);
        LocalStorageAdapter.set(`dependencies-selectedGraph-${$repositories.getActiveRepository()}`, selectedGraph);
    };

    $scope.getSelectedGraphValue = function () {
        return selectedGraph.contextID.value;
    };

    $scope.isAllGraphsSelected = function () {
        return $scope.getSelectedGraphValue() === 'all.graphs.label';
    };
}
