const modules = [
    'ui.scroll.jqlite',
    'ui.scroll',
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories'
];

angular
    .module('graphdb.framework.graphexplore.controllers.dependencies', modules)
    .controller('DependenciesChordCtrl', DependenciesChordCtrl)
    .config(['$tooltipProvider', function ($tooltipProvider) {
        $tooltipProvider.options({appendToBody: true});
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

DependenciesChordCtrl.$inject = ['$scope', '$rootScope', '$repositories', 'toastr', '$timeout', 'GraphDataRestService', 'UiScrollService', 'ModalService'];

function DependenciesChordCtrl($scope, $rootScope, $repositories, toastr, $timeout, GraphDataRestService, UiScrollService, ModalService) {

    let timer;

    $scope.status = !$repositories.getActiveRepository() ? 'NO_REPO' : 'WAIT';

    const getRelationshipsData = function (selectedClasses) {
        d3.select('#dependencies-chord').html('');

        $scope.status = 'WAIT';

        GraphDataRestService.getRelationshipsData(selectedClasses, $scope.direction)
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
                $scope.status = 'READY';
            }).error(function (data) {
            $scope.status = 'READY';
            toastr.error(getError(data), 'Could not get dependencies count');
        });
    };

    const getRelationshipsClasses = function () {
        GraphDataRestService.getRelationshipsClasses($scope.direction)
            .success(function (classesData, status) {
                $scope.allClasses.items = _.filter(classesData, classFilterFunc);
                $scope.allNotFilteredClasses = classesData;
                if (angular.isUndefined($scope.selectedClasses)) {
                    $scope.selectedClasses = classesData.slice(0, 10);
                }
                getRelationshipsData($scope.selectedClasses);
                if (status === 207) {
                    toastr.warning('You can update the diagram by pressing the reload button.', 'Repository data has changed');
                }
            });
    };

    const getRelationshipsStatus = function (force) {
        if ($scope.status === 'READY' && !force) {
            return;
        }
        $scope.status = 'WAIT';
        GraphDataRestService.getRelationshipsStatus()
            .success(function (data) {
                $scope.status = data;
                if ($scope.status === 'IN_PROGRESS') {
                    if (timer) {
                        return;
                    } else {
                        timer = $timeout(getRelationshipsStatus, 2000);
                    }
                }
                if ($scope.status === 'READY') {
                    getRelationshipsClasses();
                }
                if ($scope.status.indexOf('ERROR;') === 0) {
                    $scope.status = 'ERROR';
                    toastr.error('There was an error while calculating dependencies: ' + $scope.status.substring('ERROR;'.length));
                }
            })
            .error(function (data) {
                $scope.status = 'ERROR';
                toastr.error(getError(data), 'Could not get dependencies count status!');
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
        return UiScrollService.initLazyList(index, count, success, position, $scope.allClasses.items);
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
        if (!$repositories.getActiveRepository() || $scope.isSystemRepository()) {
            return;
        }
        if ($scope.status === 'READY') {
            getRelationshipsClasses();
        } else {
            getRelationshipsStatus();
        }
    });

    $scope.$on('$destroy', function () {
        $timeout.cancel(timer);
    });

    $scope.isLoading = function () {
        return $scope.status === 'IN_PROGRESS' || $scope.status === 'WAIT';
    };

    $scope.confirmCalculateDependencies = function () {
        ModalService.openSimpleModal({
            title: 'Confirm operation',
            message: 'Calculating relationships data may take some time. Are you sure?',
            warning: true
        }).result
            .then(function () {
                $scope.calculateDependencies();
            });
    };

    $scope.calculateDependencies = function () {
        $scope.status = 'WAIT';
        $scope.selectedClasses = undefined;
        GraphDataRestService.calculateRelationships()
            .success(function (data) {
                if (data.indexOf('ERROR;') === 0) {
                    toastr.error('There was an error while calculating dependencies: ' + data.substring('ERROR;'.length));
                } else {
                    getRelationshipsStatus();
                }
            })
            .error(function (data) {
                toastr.error('Could not force dependencies count' + getError(data));
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

        if (!$repositories.getActiveRepository()) {
            $scope.status = 'NO_REPO';
            return;
        }
        if (!$scope.isSystemRepository()) {
            $scope.status = 'WAIT';
            $scope.selectedClasses = undefined;
            getRelationshipsStatus(true);
        }
    }

    $scope.$on('repositoryIsSet', onRepositoryIsSet);

}
