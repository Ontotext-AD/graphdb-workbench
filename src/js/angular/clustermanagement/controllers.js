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
    .controller('DeleteClusterCtrl', DeleteClusterCtrl)
    .controller('AddNodesDialogCtrl', AddNodesDialogCtrl)
    .controller('RemoveNodesDialogCtrl', RemoveNodesDialogCtrl);

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$modal', '$sce',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService', 'RepositoriesRestService', '$location', '$translate'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $modal, $sce,
    $window, $interval, ModalService, $timeout, ClusterRestService, RepositoriesRestService, $location, $translate) {
    $scope.loader = true;
    $scope.isLeader = false;
    $scope.hasClusterConfiguration = false;
    $scope.curentNodeAddress = '';
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
        ClusterRestService.getClusterConfig()
            .success((data, status) => {
                $scope.clusterConfiguration = data;
                $scope.hasClusterConfiguration = true;
                $scope.getCurrentNodeStatus();
            })
            .error((data, status) => {
                $scope.clusterConfiguration = null;
                $scope.hasClusterConfiguration = false;
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
                    $scope.isLeader = $scope.leader.address === $scope.curentNodeAddress;

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
                    $scope.hasClusterConfiguration = false;
                }
            })
            .finally(() => $scope.setLoader(false));
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
                .finally(() => $scope.setLoader(false));
        });
    };

    $scope.addNodeToCluster = () => {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/add-nodes-dialog.html',
            controller: 'AddNodesDialogCtrl',
            resolve: {
                data: function () {
                    return {
                        clusterConfiguration: $scope.clusterConfiguration
                    };
                }
            }
        });

        modalInstance.result.then(function (nodes) {
            const loaderMessage = $translate.instant('cluster_management.cluster_page.add_nodes_loader');
            $scope.setLoader(true, loaderMessage);
            ClusterRestService.addNodesToCluster(nodes)
                .success(() => {
                    const successMessage = $translate.instant(
                        'cluster_management.cluster_page.notifications.add_nodes_success');
                    onAddRemoveSuccess(successMessage);
                })
                .error((data, status) => {
                    const failMessageTitle = $translate.instant('cluster_management.cluster_page.notifications.add_nodes_fail');
                    handleAddRemoveErrors(data, status, failMessageTitle);
                })
                .finally(() => $scope.setLoader(false));
        });
    };

    $scope.removeNodesFromCluster = () => {
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/remove-nodes-dialog.html',
            controller: 'RemoveNodesDialogCtrl',
            resolve: {
                data: function () {
                    return {
                        clusterConfiguration: $scope.clusterConfiguration
                    };
                }
            }
        });

        modalInstance.result.then(function (nodes) {
            const loaderMessage = $translate.instant('cluster_management.cluster_page.remove_nodes_loader');
            $scope.setLoader(true, loaderMessage);
            ClusterRestService.removeNodesFromCluster(nodes)
                .success(() => {
                    const successMessage = $translate.instant('cluster_management.cluster_page.notifications.remove_nodes_success');
                    onAddRemoveSuccess(successMessage);
                })
                .error((data, status) => {
                    const failMessageTitle = $translate.instant('cluster_management.cluster_page.notifications.remove_nodes_fail');
                    handleAddRemoveErrors(data, status, failMessageTitle);
                })
                .finally(() => $scope.setLoader(false));
        });
    };

    function onAddRemoveSuccess(message) {
        toastr.success(message);
        $scope.getClusterConfiguration();
    }

    function handleAddRemoveErrors(data, status, title) {
        let failMessage = data;

        if (status === 400 && Array.isArray(data)) {
            failMessage = data.reduce((acc, error) => acc += `<div>${error}</div>`, '');
        } else if (status === 412) {
            failMessage = Object.keys(data)
                .reduce((message, key) => message += `<div>${key} - ${data[key]}</div>`, '');
        }

        toastr.error(failMessage, title, {allowHtml: true});
    }

    $scope.getCurrentNodeStatus = () => {
        ClusterRestService.getNodeStatus()
            .success((data) => {
                $scope.isLeader = data.nodeState === 'LEADER';
                $scope.curentNodeAddress = data.address;
            })
            .error((data) => {
                if (!$scope.curentNodeAddress) {
                    $scope.curentNodeAddress = Object.keys(data)[0];
                }
                $scope.isLeader = false;
            });
    };

    $scope.setLoader(true);
    $scope.getClusterConfiguration();
    $scope.getClusterStatus();
    $scope.getCurrentNodeStatus();

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

export const RPC_ADDRESS_PATTERN = new RegExp('^[\\w\\d][\\w\\d\\.]+:[\\d]+\\/?\\w*');

CreateClusterCtrl.$inject = ['$rootScope', '$scope', '$routeParams', '$location', '$timeout', 'ClusterRestService', 'toastr', '$translate'];

function CreateClusterCtrl($rootScope, $scope, $routeParams, $location, $timeout, ClusterRestService, toastr, $translate) {
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

    function getCurrentNodeStatus() {
        return ClusterRestService.getNodeStatus()
            .then((data) => {
                $scope.currentNode = data;
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

    $scope.onInput = function () {
        $scope.badRpcAddress = false;
    };

    $scope.addNodeToList = function (nodeRpcAddress) {
        if (!nodeRpcAddress || $scope.clusterConfiguration.nodes.includes(nodeRpcAddress)) {
            return;
        } else if (!RPC_ADDRESS_PATTERN.test(nodeRpcAddress)) {
            $scope.badRpcAddress = true;
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
    $scope.forceDelete = false;

    $scope.ok = function () {
        $modalInstance.close($scope.forceDelete);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

AddNodesDialogCtrl.$inject = ['$scope', '$modalInstance', 'data'];

function AddNodesDialogCtrl($scope, $modalInstance, data) {
    $scope.clusterConfiguration = angular.copy(data.clusterConfiguration);
    $scope.nodes = [];

    $scope.addNodeToList = function (nodeRpcAddress) {
        if (!nodeRpcAddress || $scope.nodes.includes(nodeRpcAddress)) {
            return;
        }
        $scope.nodes.push(nodeRpcAddress);
        $scope.rpcAddress = '';
    };

    $scope.removeNodeFromList = function (index, node) {
        $scope.nodes.splice(index, 1);
    };

    $scope.canAddNode = (rpcAddress) => {
        return rpcAddress && !$scope.nodes.includes(rpcAddress) && !$scope.clusterConfiguration.nodes.includes(rpcAddress);
    };

    $scope.ok = function () {
        $modalInstance.close($scope.nodes);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

RemoveNodesDialogCtrl.$inject = ['$scope', '$modalInstance', 'data'];

function RemoveNodesDialogCtrl($scope, $modalInstance, data) {
    $scope.nodes = angular.copy(data.clusterConfiguration.nodes);
    $scope.nodesToRemove = [];

    $scope.toggleNode = function (index, node) {
        const nodeIndex = $scope.nodesToRemove.indexOf(node);
        if (nodeIndex > -1) {
            $scope.nodesToRemove.splice(nodeIndex, 1);
        } else {
            $scope.nodesToRemove.push(node);
        }
    };

    $scope.ok = function () {
        $modalInstance.close($scope.nodesToRemove);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
