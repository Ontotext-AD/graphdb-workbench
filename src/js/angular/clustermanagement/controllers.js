import 'angular/core/services';
import 'angular/rest/cluster.rest.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.cluster.service',
    'toastr'
];

angular
    .module('graphdb.framework.clustermanagement.controllers', modules)
    .controller('ClusterManagementCtrl', ClusterManagementCtrl)
    .controller('CreateClusterCtrl', CreateClusterCtrl)
    .controller('DeleteClusterCtrl', DeleteClusterCtrl);

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$modal', '$sce',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService', 'RepositoriesRestService', '$location', '$translate'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $modal, $sce,
    $window, $interval, ModalService, $timeout, ClusterRestService, RepositoriesRestService, $location, $translate) {
    $scope.loader = true;
    // TODO: Similar function is declared multiple times in different components. Find out how to avoid it!
    $scope.setLoader = function (loader, message) {
        $scope.loader = loader;
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 50);
        } else {
            $scope.loader = false;
        }
    };

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.createCluster = function () {
        $location.path(`${$location.path()}/create`);
    };

    $scope.getClusterConfiguration = () => {
        $scope.setLoader(true);
        ClusterRestService.getClusterConfig()
            .success((data, status) => {
                $scope.clusterConfiguration = data;
            })
            .error((data, status) => {
                $scope.clusterConfiguration = null;
            })
            .finally(() => {
                $scope.setLoader(false);
            });
    };

    $scope.getClusterStatus = function () {
        ClusterRestService.getClusterStatus()
            .success(function (data, status) {
                if (!$scope.clusterConfiguration) {
                    $scope.getClusterConfiguration();
                    return;
                }
                $scope.leader = data.find((node) => node.nodeState === 'LEADER');

                if ($scope.leader) {
                    $scope.followers = data.filter((node) => node !== $scope.leader);
                    $scope.followers.forEach((node) => {
                        node.syncStatus = $scope.leader.syncStatus[node.address];
                    });
                } else {
                    $scope.followers = data;
                }
            })
            .error(function (data, status) {
                if (status === 404) {
                    $scope.clusterConfiguration = null;
                }
            });
    };

    $scope.showDeleteDialog = () => {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-delete-dialog.html',
            controller: 'DeleteClusterCtrl'
        });

        modalInstance.result.then(function (forceDelete) {
            const loaderMessage = $translate.instant('cluster_management.delete_cluster_dialog.loader_message');
            $scope.setLoader(true, loaderMessage);
            ClusterRestService.deleteCluster(!!forceDelete)
                .success((data) => {
                    const allNodesDeleted = Object.values(data).every((node) => node === 'DELETED');
                    if (allNodesDeleted) {
                        const successMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.success_delete');
                        toastr.success(successMessage);
                    } else {
                        const successMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.success_delete_partial');
                        const failedNodesList = Object.keys(data)
                            .reduce((message, key) => message += `<div>${key} - ${data[key]}</div>`, '');
                        toastr.success(failedNodesList, successMessage, {allowHtml: true});
                    }
                    $scope.getClusterConfiguration();
                })
                .error((data) => {
                    const failMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.fail_delete');
                    const failedNodesList = Object.keys(data)
                        .reduce((message, key) => message += `<div>${key} - ${data[key]}</div>`, '');
                    toastr.error(failedNodesList, failMessage, {allowHtml: true});
                })
                .finally(() => $scope.setLoader(false));
        });
    };

    $scope.getClusterConfiguration();
    $scope.getClusterStatus();

    let timerCounter = 0;
    const timer = $interval(function () {
        if (timerCounter % 3 === 0) {
            $scope.getClusterConfiguration();
        }
        timerCounter++;
        if ($scope.clusterConfiguration) {
            $scope.getClusterStatus();
        }
    }, 2000);

    $scope.$on("$destroy", function () {
        $interval.cancel(timer);
    });
}

CreateClusterCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$timeout', 'ClusterRestService', 'toastr', '$translate',
    'LocationsRestService', '$interval'];

function CreateClusterCtrl($rootScope, $scope, $routeParams, $location, $timeout, ClusterRestService, toastr, $translate,
    LocationsRestService, $interval) {
    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.create_page_title');
    $scope.autofocusId = 'autofocus';
    $scope.errors = [];
    $scope.clusterConfiguration = {
        electionMinTimeout: 1500,
        electionRangeTimeout: 2000,
        heartbeatInterval: 500,
        messageSizeKB: 64,
        nodes: [],
        verificationTimeout: 1500
    };

    $rootScope.$on('$translateChangeSuccess', function () {
        $scope.pageTitle = $translate.instant('cluster_management.cluster_page.create_page_title');
    });

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.goToClusterManagementPage = function () {
        $location.path('/cluster');
    };

    $scope.createCluster = function () {
        if (!validateClusterSettings()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.creating_cluster_loader'));
        ClusterRestService.createCluster($scope.clusterConfiguration)
            .success(function (data, status) {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.create_success'));
                const timer = $timeout(function () {
                    $scope.setLoader(false);
                    $scope.goToClusterManagementPage();
                }, 2000);
                $scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });
            })
            .error(function (data, status) {
                handleErrors(data, status);
                $scope.setLoader(false);
            });
    };

    function handleErrors(data, status) {
        delete $scope.preconditionErrors;
        toastr.error($translate.instant('cluster_management.cluster_page.notifications.create_failed'));
        $scope.errors.splice(0);
        if (status === 412) {
            $scope.preconditionErrors = Object.keys(data).map((key) => `${key} - ${data[key]}`);
        } else if (status === 400) {
            $scope.errors.push(...data);
        } else if (status === 409) {
            $scope.errors.push(data);
        }
    }

    function validateClusterSettings() {
        const isFormValid = !$scope.clusterConfigurationForm.$invalid;
        const nodesListValid = $scope.clusterConfiguration.nodes && $scope.clusterConfiguration.nodes.length >= 2;
        return isFormValid && nodesListValid;
    }

    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
                $scope.loaderMessage = message;
            }, 300);
        } else {
            $scope.loader = false;
        }
    };

    $scope.addNodeToList = function (nodeRpcAddress) {
        if (!nodeRpcAddress || $scope.clusterConfiguration.nodes.includes(nodeRpcAddress)) {
            return;
        }
        $scope.clusterConfiguration.nodes.push(nodeRpcAddress);
        $scope.rpcAddress = '';
    };

    $scope.removeNodeFromList = function (index, node) {
        $scope.clusterConfiguration.nodes.splice(index, 1);
    };
}

DeleteClusterCtrl.$inject = ['$scope', '$modalInstance'];

function DeleteClusterCtrl($scope, $modalInstance) {
    $scope.ok = function () {
        $modalInstance.close($scope.forceDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
