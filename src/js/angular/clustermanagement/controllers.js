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
    $scope.isLeader = false;
    $scope.currentNode = null;
    $scope.clusterModel = {};

    // Holds child context
    $scope.childContext = {};

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

    function initialize() {
        $scope.loader = true;

        $scope.getCurrentNodeStatus()
            .then(() => {
                return $scope.getClusterConfiguration();
            })
            .then(() => {
                return $scope.getClusterStatus();
            })
            .finally(() => {
                $scope.setLoader(false);
            });
    }

    function updateCluster() {
        $scope.getClusterStatus()
            .then(() => {
                if (!$scope.clusterConfiguration) {
                    return $scope.getClusterConfiguration();
                }
            })
            .then(() => {
                if (!$scope.currentNode) {
                    return $scope.getCurrentNodeStatus();
                }
            })
            .finally(() => $scope.childContext.redraw());
    }

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.getClusterConfiguration = () => {
        return ClusterRestService.getClusterConfig()
            .success((data) => {
                $scope.clusterConfiguration = data;
            })
            .error(() => {
                $scope.clusterConfiguration = null;
            });
    };

    $scope.getClusterStatus = function () {
        return ClusterRestService.getClusterStatus()
            .success(function (data) {
                $scope.leader = data.find((node) => node.nodeState === 'LEADER');

                if ($scope.leader) {
                    $scope.followers = data.filter((node) => node !== $scope.leader);
                    $scope.followers.forEach((node) => {
                        node.syncStatus = $scope.leader.syncStatus[node.address];
                    });
                } else {
                    $scope.followers = data;
                }
                $scope.clusterModel.hasCluster = true;
            })
            .error(function (data, status) {
                if (status === 404) {
                    $scope.clusterModel.hasCluster = false;
                    $scope.clusterConfiguration = null;
                }
            });
    };

    $scope.showCreateClusterDialog = function () {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-create-dialog.html',
            controller: 'CreateClusterCtrl'
        });

        modalInstance.result.then(function () {
            updateCluster();
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
            ClusterRestService.deleteCluster(forceDelete)
                .success((data) => {
                    const allNodesDeleted = Object.values(data).every((node) => node === 'DELETED');
                    if (allNodesDeleted) {
                        const successMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.success_delete');
                        toastr.success(successMessage);
                    } else {
                        const successMessage = $translate.instant(
                            'cluster_management.delete_cluster_dialog.notifications.success_delete_partial');
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
                .finally(() => {
                    $scope.setLoader(false);
                    updateCluster();
                });
        });
    };

    $scope.getCurrentNodeStatus = () => {
        return ClusterRestService.getNodeStatus()
            .success((data) => {
                $scope.currentNode = data;
            })
            .error((error) => {
                $scope.currentNode = error.data;
                $scope.clusterModel.hasCluster = false;
            });
    };

    initialize();

    const timer = $interval(function () {
        updateCluster();
    }, 1000);

    $scope.$on("$destroy", function () {
        $interval.cancel(timer);
    });

    // track window resizing
    const w = angular.element($window);
    const resize = function () {
        $scope.childContext.resize();
    };
    w.bind('resize', resize);
    $scope.$on('$destroy', function () {
        w.unbind('resize', resize);
    });
}

const getAdvancedOptionsClass = function () {
    const optionsModule = document.getElementById('advancedOptions');

    if (optionsModule) {
        const isAriaExpanded = optionsModule.getAttribute('aria-expanded');
        if (isAriaExpanded && isAriaExpanded === 'true') {
            return 'fa fa-angle-down';
        }
    }
    return 'fa fa-angle-right';
};

CreateClusterCtrl.$inject = ['$scope', '$modalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate'];

function CreateClusterCtrl($scope, $modalInstance, $timeout, ClusterRestService, toastr, $translate) {
    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.create_page_title');
    $scope.autofocusId = 'autofocus';
    $scope.errors = [];
    $scope.clusterConfiguration = {
        electionMinTimeout: 7000,
        electionRangeTimeout: 5000,
        heartbeatInterval: 2000,
        messageSizeKB: 64,
        nodes: [],
        verificationTimeout: 1500
    };

    $scope.loader = false;

    function getCurrentNodeStatus() {
        return ClusterRestService.getNodeStatus()
            .then((res) => {
                $scope.currentNode = res.data;
            })
            .catch((error) => {
                $scope.currentNode = error.data;
            })
            .finally(() => {
                $scope.clusterConfiguration.nodes.push($scope.currentNode.address);
            });
    }

    getCurrentNodeStatus();

    $scope.getAdvancedOptionsClass = getAdvancedOptionsClass;

    $scope.createCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.creating_cluster_loader'));
        return ClusterRestService.createCluster($scope.clusterConfiguration)
            .success(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.create_success'));
                $modalInstance.close();
            })
            .error(function (data, status) {
                handleErrors(data, status);
            })
            .finally(() => $scope.setLoader(false));
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

    $scope.isClusterConfigurationValid = () => {
        const isFormValid = !$scope.clusterConfigurationForm.$invalid;
        const nodesListValid = $scope.clusterConfiguration.nodes && $scope.clusterConfiguration.nodes.length >= 2;
        return isFormValid && nodesListValid;
    };

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

    $scope.ok = function () {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.createCluster();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

DeleteClusterCtrl.$inject = ['$scope', '$modalInstance'];

function DeleteClusterCtrl($scope, $modalInstance) {
    $scope.forceDelete = false;

    $scope.ok = function () {
        $modalInstance.close($scope.forceDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
