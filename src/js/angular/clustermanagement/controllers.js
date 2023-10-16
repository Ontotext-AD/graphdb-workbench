import 'angular/core/services';
import 'angular/rest/cluster.rest.service';
import {isString} from "lodash";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.cluster.service',
    'toastr',
    'pageslide-directive'
];

angular
    .module('graphdb.framework.clustermanagement.controllers', modules)
    .controller('ClusterManagementCtrl', ClusterManagementCtrl)
    .controller('CreateClusterCtrl', CreateClusterCtrl)
    .controller('DeleteClusterCtrl', DeleteClusterCtrl)
    .controller('EditClusterCtrl', EditClusterCtrl)
    .controller('AddLocationFromClusterCtrl', AddLocationFromClusterCtrl)
    .controller('AddNodesDialogCtrl', AddNodesDialogCtrl)
    .controller('RemoveNodesDialogCtrl', RemoveNodesDialogCtrl)
    .factory('RemoteLocationsService', RemoteLocationsService);

export const NodeState = {
    LEADER: 'LEADER',
    FOLLOWER: 'FOLLOWER',
    CANDIDATE: 'CANDIDATE',
    OUT_OF_SYNC: 'OUT_OF_SYNC',
    NO_CONNECTION: 'NO_CONNECTION',
    READ_ONLY: 'READ_ONLY',
    RESTRICTED: 'RESTRICTED',
    NO_CLUSTER: 'NO_CLUSTER'
};

export const RecoveryState = {
    SEARCHING_FOR_NODE: 'SEARCHING_FOR_NODE',
    WAITING_FOR_SNAPSHOT: 'WAITING_FOR_SNAPSHOT',
    RECEIVING_SNAPSHOT: 'RECEIVING_SNAPSHOT',
    APPLYING_SNAPSHOT: 'APPLYING_SNAPSHOT',
    BUILDING_SNAPSHOT: 'BUILDING_SNAPSHOT',
    SENDING_SNAPSHOT: 'SENDING_SNAPSHOT'
};

export const LinkState = {
    IN_SYNC: 'IN_SYNC',
    OUT_OF_SYNC: 'OUT_OF_SYNC',
    SYNCING: 'SYNCING',
    NO_CONNECTION: 'NO_CONNECTION'
};

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$uibModal', '$sce', '$jwtAuth',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService', '$location', '$translate', 'RemoteLocationsService', '$rootScope'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $uibModal, $sce, $jwtAuth,
    $window, $interval, ModalService, $timeout, ClusterRestService, $location, $translate, RemoteLocationsService, $rootScope) {
    $scope.loader = true;
    $scope.isLeader = false;
    $scope.currentNode = null;
    $scope.clusterModel = {};
    $scope.NodeState = NodeState;
    $scope.leaderChanged = false;
    $scope.currentLeader = null;

    $scope.isAdmin = function () {
        return $jwtAuth.isAuthenticated() && $jwtAuth.isAdmin();
    };

    // Holds child context
    $scope.childContext = {};

    $scope.shouldShowClusterSettingsPanel = false;
    const DELETED_ON_NODE_MESSAGE = 'Cluster was deleted on this node.';
    $scope.onopen = $scope.onclose = () => angular.noop();

    $scope.toggleSidePanel = () => {
        $scope.shouldShowClusterSettingsPanel = !$scope.shouldShowClusterSettingsPanel;
    };

    $scope.toggleLegend = () => {
        if ($scope.childContext.toggleLegend) {
            $scope.childContext.toggleLegend();
        }
    };

    // TODO: Similar function is declared multiple times in different components. Find out how to avoid it!
    $scope.setLoader = function (loader, message) {
        $timeout.cancel($scope.loaderTimeout);
        if (loader) {
            $scope.loaderMessage = message;
            $scope.loaderTimeout = $timeout(function () {
                $scope.loader = loader;
            }, 50);
        } else {
            $scope.loader = false;
        }
    };

    function selectNode(node) {
        if ($scope.selectedNode !== node) {
            $scope.selectedNode = node;
        } else {
            $scope.selectedNode = null;
        }
        $scope.$apply();
    }

    $scope.childContext.selectNode = selectNode;

    function initialize() {
        $scope.loader = true;

        return $scope.getCurrentNodeStatus()
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

    let updateRequest;
    function updateCluster(force) {
        if (updateRequest) {
            return;
        }

        updateRequest = $scope.getClusterStatus()
            .then(() => {
                if (force || !$scope.clusterConfiguration) {
                    return $scope.getClusterConfiguration();
                }
            })
            .then(() => {
                if (!$scope.currentNode || $scope.leaderChanged) {
                    return $scope.getCurrentNodeStatus();
                }
            })
            .finally(() => {
                updateRequest = null;
                $scope.childContext.redraw();
            });
    }

    $scope.getLoaderMessage = function () {
        return $scope.loaderMessage || $translate.instant('common.loading');
    };

    $scope.getClusterConfiguration = () => {
        return ClusterRestService.getClusterConfig()
            .then((response) => {
                $scope.clusterConfiguration = response.data;
                if (!$scope.currentNode) {
                    return $scope.getCurrentNodeStatus();
                }
            })
            .catch(() => {
                $scope.clusterConfiguration = null;
            });
    };

    function isLeaderChanged(currentLeader, newLeader) {
        if (!newLeader) {
            // If election is in place and there is no leader yet, consider it as leader change
            return true;
        }
        return !currentLeader || currentLeader.address !== newLeader.address;
    }

    $scope.getClusterStatus = function () {
        return ClusterRestService.getClusterStatus()
            .then(function (response) {
                const nodes = response.data.slice();
                const leader = nodes.find((node) => node.nodeState === NodeState.LEADER);

                if (isLeaderChanged($scope.currentLeader, leader)) {
                    $scope.currentLeader = leader;
                    $scope.leaderChanged = true;
                }
                $scope.currentNode = nodes.find((node) => node.address === $scope.currentNode.address);

                const links = [];
                if (leader) {
                    Object.keys(leader.syncStatus).forEach((node) => {
                        const status = leader.syncStatus[node];
                        if (status !== LinkState.NO_CONNECTION) {
                            links.push({
                                id: `${leader.address}-${node}`,
                                source: leader.address,
                                target: node,
                                status
                            });
                        }
                    });
                }
                $scope.clusterModel.hasCluster = true;
                $scope.clusterModel.nodes = nodes;
                $scope.clusterModel.links = links;
            })
            .catch(function (error) {
                if (error.status === 404) {
                    $scope.clusterModel.hasCluster = false;
                    $scope.clusterModel.nodes = [];
                    $scope.clusterModel.links = [];
                    $scope.clusterConfiguration = null;
                }
            });
    };

    $scope.showCreateClusterDialog = function () {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-create-dialog.html',
            controller: 'CreateClusterCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        deleteLocation: deleteLocation,
                        clusterModel: $scope.clusterModel
                    };
                }
            }
        });

        modalInstance.result.finally(function () {
            getLocationsWithRpcAddresses();
            updateCluster(true);
        });
    };

    $scope.showDeleteDialog = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-delete-dialog.html',
            controller: 'DeleteClusterCtrl'
        });

        modalInstance.result.then(function (forceDelete) {
            const loaderMessage = $translate.instant('cluster_management.delete_cluster_dialog.loader_message');
            $scope.setLoader(true, loaderMessage);
            ClusterRestService.deleteCluster(forceDelete)
                .then((response) => {
                    const allNodesDeleted = Object.values(response.data).every((resultMsg) => resultMsg === DELETED_ON_NODE_MESSAGE);
                    if (allNodesDeleted) {
                        const successMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.success_delete');
                        toastr.success(successMessage);
                    } else {
                        const successMessage = $translate.instant(
                            'cluster_management.delete_cluster_dialog.notifications.success_delete_partial');
                        const failedNodesList = Object.keys(response.data)
                            .reduce((message, key) => message += `<div>${key} - ${response.data[key]}</div>`, '');
                        toastr.warning(failedNodesList, successMessage, {allowHtml: true});
                    }
                    $scope.getClusterConfiguration();
                })
                .catch((error) => {
                    const failMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.fail_delete');
                    handleErrors(error.data, error.status, failMessage);
                })
                .finally(() => {
                    $scope.setLoader(false);
                    updateCluster(true);
                    $rootScope.$broadcast('reloadLocations');
                });
        });
    };

    $scope.showEditConfigurationDialog = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-edit-dialog.html',
            controller: 'EditClusterCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        clusterConfiguration: $scope.clusterConfiguration
                    };
                }
            }
        });

        modalInstance.result.finally(function () {
            updateCluster(true);
        });
    };

    $scope.getCurrentNodeStatus = () => {
        return ClusterRestService.getNodeStatus()
            .then((response) => {
                $scope.leaderChanged = false;
                $scope.currentNode = response.data;
            })
            .catch((error) => {
                $scope.currentNode = error.data;
                $scope.clusterModel.hasCluster = false;
            })
            .then(() => getLocationsWithRpcAddresses());
    };

    function getLocationsWithRpcAddresses() {
        return RemoteLocationsService.getLocationsWithRpcAddresses()
            .then((locations) => {
                const localNode = locations.find((location) => location.isLocal);
                if (localNode) {
                    localNode.endpoint = $scope.currentNode.endpoint;
                    localNode.rpcAddress = $scope.currentNode.address;
                }
                $scope.clusterModel.locations = locations;
            });
    }

    //Delete location
    const deleteLocation = function (location) {
        return ModalService.openSimpleModal({
            title: $translate.instant('location.confirm.detach'),
            message: $translate.instant('location.confirm.detach.warning', {uri: location.endpoint}),
            warning: true
        }).result.then(() => $repositories.deleteLocation(location.endpoint));
    };

    $scope.showAddNodeToClusterDialog = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/add-nodes-dialog.html',
            controller: 'AddNodesDialogCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        deleteLocation: deleteLocation,
                        clusterModel: $scope.clusterModel,
                        clusterConfiguration: $scope.clusterConfiguration
                    };
                }
            }
        });

        modalInstance.result.then(function (nodes) {
            const loaderMessage = $translate.instant('cluster_management.cluster_page.add_nodes_loader');
            $scope.setLoader(true, loaderMessage);

            const nodesRpcAddress = nodes.map((node) => node.rpcAddress);
            ClusterRestService.addNodesToCluster(nodesRpcAddress)
                .then(() => {
                    const successMessage = $translate.instant(
                        'cluster_management.cluster_page.notifications.add_nodes_success');
                    onAddRemoveSuccess(successMessage);
                })
                .catch((error) => {
                    const failMessageTitle = $translate.instant('cluster_management.cluster_page.notifications.add_nodes_fail');
                    handleErrors(error.data, error.status, failMessageTitle);
                })
                .finally(() => {
                    $scope.setLoader(false);
                    updateCluster(true);
                });
        })
            .finally(() => getLocationsWithRpcAddresses());
    };

    $scope.showRemoveNodesFromClusterDialog = () => {
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/remove-nodes-dialog.html',
            controller: 'RemoveNodesDialogCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        clusterModel: $scope.clusterModel
                    };
                }
            }
        });

        modalInstance.result.then(function (nodes) {
            const loaderMessage = $translate.instant('cluster_management.cluster_page.remove_nodes_loader');
            $scope.setLoader(true, loaderMessage);

            const nodesRpcAddress = nodes.map((node) => node.address);
            ClusterRestService.removeNodesFromCluster(nodesRpcAddress)
                .then(() => {
                    const successMessage = $translate.instant('cluster_management.cluster_page.notifications.remove_nodes_success');
                    onAddRemoveSuccess(successMessage);
                })
                .catch((error) => {
                    const failMessageTitle = $translate.instant('cluster_management.cluster_page.notifications.remove_nodes_fail');
                    handleErrors(error.data, error.status, failMessageTitle);
                })
                .finally(() => {
                    $scope.setLoader(false);
                    updateCluster(true);
                });
        });
    };

    function onAddRemoveSuccess(message) {
        toastr.success(message);
        $scope.getClusterConfiguration();
    }

    function handleErrors(data, status, title) {
        let failMessage = data.message || data;

        if (status === 400 && Array.isArray(data)) {
            failMessage = data.reduce((acc, error) => acc += `<div>${error}</div>`, '');
        } else if (status === 412 && !isString(data)) {
            failMessage = Object.keys(data)
                .reduce((message, key) => message += `<div>${key} - ${data[key]}</div>`, '');
        }
        toastr.error(failMessage, title, {allowHtml: true});
    }

    initialize()
        .finally(() => {
            const timer = $interval(function () {
                updateCluster();
            }, 1000);

            $scope.$on("$destroy", function () {
                $interval.cancel(timer);
            });
        });

    // track window resizing and window mousedown
    const w = angular.element($window);
    const resize = function () {
        $scope.childContext.resize();
    };
    w.bind('resize', resize);

    const mousedown = function (event) {
        const target = event.target;
        const nodeTooltipElement = document.getElementById('nodeTooltip');
        if ($scope.selectedNode && nodeTooltipElement !== target && !nodeTooltipElement.contains(target)) {
            $scope.childContext.selectNode(null);
        }
    };
    w.bind('mousedown', mousedown);
    $scope.$on('$destroy', function () {
        w.unbind('resize', resize);
        w.unbind('mousedown', mousedown);
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

CreateClusterCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data', '$uibModal',
    'RemoteLocationsService', '$rootScope'];

function CreateClusterCtrl($scope, $uibModalInstance, $timeout, ClusterRestService, toastr, $translate, data, $uibModal, RemoteLocationsService, $rootScope) {
    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.create_page_title');
    $scope.autofocusId = 'autofocus';
    $scope.errors = [];
    $scope.clusterConfiguration = {
        electionMinTimeout: 8000,
        electionRangeTimeout: 6000,
        heartbeatInterval: 2000,
        messageSizeKB: 64,
        verificationTimeout: 1500,
        transactionLogMaximumSizeGB: 50,
        nodes: []
    };

    $scope.locations = data.clusterModel.locations.filter((location) => !location.isLocal);
    $scope.selectedLocations = data.clusterModel.locations.filter((location) => location.isLocal);

    $scope.loader = false;

    $scope.deleteLocation = function (event, location) {
        event.preventDefault();
        event.stopPropagation();
        data.deleteLocation(location).then(() => $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint));
    };

    $scope.getAdvancedOptionsClass = getAdvancedOptionsClass;

    $scope.createCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.creating_cluster_loader'));
        $scope.clusterConfiguration.nodes = $scope.selectedLocations.map((node) => node.rpcAddress);
        return ClusterRestService.createCluster($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.create_success'));
                $uibModalInstance.close();
            })
            .catch(function (error) {
                handleErrors(error.data, error.status);
            })
            .finally(() => {
                $scope.setLoader(false);
                $rootScope.$broadcast('reloadLocations');
            });
    };

    function handleErrors(data, status) {
        let failMessage;
        delete $scope.preconditionErrors;
        $scope.errors.splice(0);
        if (status === 412) {
            $scope.preconditionErrors = Object.keys(data).map((key) => `${key} - ${data[key]}`);
        } else if (status === 400) {
            $scope.errors.push(...data);
        } else if (status === 409) {
            $scope.errors.push(data);
        } else if (data.message || typeof data === 'string'){
            failMessage = data.message || data;
        }
        toastr.error(failMessage, $translate.instant('cluster_management.cluster_page.notifications.create_failed'));

    }

    $scope.isClusterConfigurationValid = () => {
        const isFormValid = !$scope.clusterConfigurationForm.$invalid;
        const nodesListValid = $scope.selectedLocations && $scope.selectedLocations.length >= 2;
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

    $scope.addNodeToList = function (location) {
        if (!location.rpcAddress) {
            return;
        }
        $scope.selectedLocations.push(location);
        $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint);
    };

    $scope.removeNodeFromList = function (index, node) {
        if (node.isLocal) {
            return;
        }
        $scope.selectedLocations.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.addLocation = function () {
        RemoteLocationsService.addLocation()
            .then((newLocation) => {
                if (newLocation) {
                    $scope.locations.push(newLocation);
                }
            });
    };

    $scope.ok = function () {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.createCluster();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

DeleteClusterCtrl.$inject = ['$scope', '$uibModalInstance'];

function DeleteClusterCtrl($scope, $uibModalInstance) {
    $scope.forceDelete = false;

    $scope.ok = function () {
        $uibModalInstance.close($scope.forceDelete);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

RemoteLocationsService.$inject = ['$http', 'toastr', '$uibModal', 'LocationsRestService', '$translate'];

function RemoteLocationsService($http, toastr, $uibModal, LocationsRestService, $translate) {
    return {
        addLocation: addLocation,
        getLocationsWithRpcAddresses: getLocationsWithRpcAddresses
    };

    function getLocationsWithRpcAddresses() {
        return getLocations()
            .then((locations) => {
                if (locations) {
                    return getRemoteLocationsRpcAddresses(locations);
                }
            });
    }

    /**
     * Sets multiple remote locations' rpc addresses. Skips local location and locations with errors
     * @param {any[]} locationsArray
     * @return {Promise<[]>} locationArray with filled rpc addresses
     */
    function getRemoteLocationsRpcAddresses(locationsArray) {
        const rpcAddressFetchers = locationsArray.filter((location) => !location.isLocal && !location.error).map((location) => {
            return getLocationRpcAddress(location)
                .then((response) => {
                    location.rpcAddress = response.data;
                    location.isAvailable = true;
                    return location;
                })
                .catch((error) => {
                    location.isAvailable = false;
                    location.error = getError(error.data, error.status);
                });
        });
        return Promise.allSettled(rpcAddressFetchers).then(() => locationsArray);
    }

    /**
     * Fetch locations and map them to a location model
     *
     * @return {*} all remote locations mapped to a location model
     */
    function getLocations() {
        return LocationsRestService.getLocations()
            .then(function (response) {
                return response.data.map((loc) => {
                    return {
                        isLocal: loc.local,
                        endpoint: loc.uri,
                        rpcAddress: loc.rpcAddress || '',
                        error: loc.errorMsg
                    };
                });
            })
            .catch(function (error) {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    }

    /**
     * Fetch rpc address of a remote location
     * @param {*} location the remote location
     * @return {Promise<String>} the rpc address of the location
     */
    function getLocationRpcAddress(location) {
        return LocationsRestService.getLocationRpcAddress(location.endpoint);

    }

    function addLocation() {
        let newLocation;
        return $uibModal.open({
            templateUrl: 'js/angular/templates/modal/add-location.html',
            windowClass: 'addLocationDialog',
            controller: 'AddLocationFromClusterCtrl'
        }).result
            .then((dataAddLocation) => {
                newLocation = dataAddLocation;
                newLocation.isLocal = false;
                newLocation.endpoint = newLocation.uri;
                return addLocationHttp(newLocation);
            });
    }

    function addLocationHttp(locationData) {
        let newLocation;
        return LocationsRestService.addLocation(locationData)
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
                return false;
            })
            .then((locationAdded) => {
                if (locationAdded) {
                    return getLocationsWithRpcAddresses();
                }
                return false;
            })
            .then((locations) => {
                if (locations === false) {
                    return;
                }
                newLocation = locations.find((location) => location.endpoint === locationData.uri);
                return newLocation;
            });
    }
}

AddLocationFromClusterCtrl.$inject = ['$scope', '$uibModalInstance', 'toastr', 'productInfo', '$translate'];

function AddLocationFromClusterCtrl($scope, $uibModalInstance, toastr, productInfo, $translate) {
    //TODO: This, along with the view are duplicated from repositories page. Must be extracted for re-usability.
    $scope.newLocation = {
        'uri': '',
        'authType': 'signature',
        'username': '',
        'password': '',
        'active': false
    };
    $scope.docBase = getDocBase(productInfo);

    $scope.isValidLocation = function () {
        return ($scope.newLocation.uri.length < 6 ||
                $scope.newLocation.uri.indexOf('http:') === 0 || $scope.newLocation.uri.indexOf('https:') === 0)
            && $scope.newLocation.uri.indexOf('/repositories') <= -1;
    };

    $scope.ok = function () {
        if (!$scope.newLocation) {
            toastr.error($translate.instant('location.cannot.be.empty.error'));
            return;
        }
        $uibModalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

EditClusterCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data'];

function EditClusterCtrl($scope, $uibModalInstance, $timeout, ClusterRestService, toastr, $translate, data) {
    $scope.pageTitle = $translate.instant('cluster_management.cluster_page.edit_page_title');
    $scope.errors = [];
    $scope.clusterConfiguration = angular.copy(data.clusterConfiguration);
    $scope.loader = false;

    $scope.updateCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.updating_cluster_loader'));
        return ClusterRestService.updateCluster($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.update_success'));
                $uibModalInstance.close();
            })
            .catch(function (response) {
                handleErrors(response.data, response.status);
            })
            .finally(() => $scope.setLoader(false));
    };

    function handleErrors(data, status) {
        delete $scope.preconditionErrors;
        toastr.error($translate.instant('cluster_management.cluster_page.notifications.update_failed'));
        $scope.errors.splice(0);

        if (status === 409 || typeof data === 'string') {
            $scope.errors.push(data);
        } else if (status === 412) {
            $scope.preconditionErrors = Object.keys(data).map((key) => `${key} - ${data[key]}`);
        } else if (status === 400) {
            $scope.errors.push(...data);
        }
    }

    $scope.isClusterConfigurationValid = () => {
        return !$scope.clusterConfigurationForm.$invalid;
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

    $scope.ok = function () {
        if (!$scope.isClusterConfigurationValid()) {
            toastr.warning($translate.instant('cluster_management.cluster_page.notifications.form_invalid'));
            return;
        }
        $scope.updateCluster();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}`;
};

AddNodesDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'data', '$uibModal', 'RemoteLocationsService'];

function AddNodesDialogCtrl($scope, $uibModalInstance, data, $uibModal, RemoteLocationsService) {
    const clusterConfiguration = angular.copy(data.clusterConfiguration);
    const clusterModel = angular.copy(data.clusterModel);
    $scope.nodes = [];

    $scope.clusterNodes = clusterModel.nodes.map((node) => ({rpcAddress: node.address, endpoint: node.endpoint}));
    $scope.locations = clusterModel.locations.filter((location) => !clusterConfiguration.nodes.includes(location.rpcAddress));
    $scope.locations.forEach((location) => location.isNew = true);

    $scope.deleteLocation = function (event, location) {
        event.preventDefault();
        event.stopPropagation();
        data.deleteLocation(location).then(() => $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint));
    };

    $scope.addNodeToList = function (location) {
        if (!location.rpcAddress) {
            return;
        }
        $scope.nodes.push(location);
        $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint);
    };

    $scope.removeNodeFromList = function (index, node) {
        $scope.nodes.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.addLocation = function () {
        RemoteLocationsService.addLocation()
            .then((newLocation) => {
                if (newLocation) {
                    $scope.locations.push(newLocation);
                }
            });
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.nodes);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

RemoveNodesDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

function RemoveNodesDialogCtrl($scope, $uibModalInstance, data) {
    const clusterModel = angular.copy(data.clusterModel);

    $scope.clusterNodes = clusterModel.nodes;
    $scope.clusterNodes.forEach((node) => node.shouldRemove = false);
    $scope.nodesToRemoveCount = 0;
    $scope.leftNodesLessThanTwo = false;

    $scope.toggleNode = function (index, node) {
        node.shouldRemove = !node.shouldRemove;
        if (node.shouldRemove) {
            $scope.nodesToRemoveCount++;
        } else {
            $scope.nodesToRemoveCount--;
        }
        $scope.leftNodesLessThanTwo = $scope.clusterNodes.length - $scope.nodesToRemoveCount < 2;
    };

    $scope.ok = function () {
        const nodesToRemove = $scope.clusterNodes.filter((node) => node.shouldRemove);
        $uibModalInstance.close(nodesToRemove);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
