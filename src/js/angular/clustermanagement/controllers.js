import 'angular/core/services';
import 'angular/rest/cluster.rest.service';

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
    .controller('AddLocationCtrl', AddLocationCtrl);

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
export const LinkState = {
    IN_SYNC: 'IN_SYNC',
    OUT_OF_SYNC: 'OUT_OF_SYNC',
    SYNCING: 'SYNCING',
    NO_CONNECTION: 'NO_CONNECTION'
};

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$modal', '$sce',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService', '$location', '$translate', 'LocationsRestService'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $modal, $sce,
    $window, $interval, ModalService, $timeout, ClusterRestService, $location, $translate, LocationsRestService) {
    $scope.loader = true;
    $scope.isLeader = false;
    $scope.currentNode = null;
    $scope.clusterModel = {};

    // Holds child context
    $scope.childContext = {};

    $scope.shouldShowClusterSettingsPanel = false;
    $scope.onopen = $scope.onclose = () => angular.noop();

    $scope.toggleSidePanel = () => {
        $scope.shouldShowClusterSettingsPanel = !$scope.shouldShowClusterSettingsPanel;
    };

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
            .then((response) => {
                $scope.clusterConfiguration = response.data;
                if (!$scope.currentNode) {
                    $scope.getCurrentNodeStatus();
                }
            })
            .catch(() => {
                $scope.clusterConfiguration = null;
            });
    };

    $scope.getClusterStatus = function () {
        return ClusterRestService.getClusterStatus()
            .then(function (response) {
                const nodes = response.data.slice();
                const leader = response.data.find((node) => node.nodeState === NodeState.LEADER);
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
        const modalInstance = $modal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/cluster-create-dialog.html',
            controller: 'CreateClusterCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                        clusterModel: $scope.clusterModel
                    };
                }
            }
        });

        modalInstance.result.finally(function () {
            getLocations().then(() => getRemoteLocationsRpcAddresses($scope.clusterModel.locations));
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
                .then((response) => {
                    const allNodesDeleted = Object.values(response.data).every((node) => node === 'DELETED');
                    if (allNodesDeleted) {
                        const successMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.success_delete');
                        toastr.success(successMessage);
                    } else {
                        const successMessage = $translate.instant(
                            'cluster_management.delete_cluster_dialog.notifications.success_delete_partial');
                        const failedNodesList = Object.keys(response.data)
                            .reduce((message, key) => message += `<div>${key} - ${response.data[key]}</div>`, '');
                        toastr.success(failedNodesList, successMessage, {allowHtml: true});
                    }
                    $scope.getClusterConfiguration();
                })
                .catch((error) => {
                    const failMessage = $translate.instant('cluster_management.delete_cluster_dialog.notifications.fail_delete');
                    const failedNodesList = Object.keys(error.data)
                        .reduce((message, key) => message += `<div>${key} - ${error.data[key]}</div>`, '');
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
            .then((response) => {
                $scope.currentNode = response.data;
            })
            .catch((error) => {
                $scope.currentNode = error.data;
                $scope.clusterModel.hasCluster = false;
            })
            .then(() => $scope.getLocationsWithRpcAddresses());
    };

    $scope.getLocationsWithRpcAddresses = () => {
        return getLocations().then(() => getRemoteLocationsRpcAddresses($scope.clusterModel.locations));
    };

    function getLocations() {
        return LocationsRestService.getLocations()
            .then(function (response) {
                const localNode = response.data.find((location) => location.local);
                localNode.uri = $scope.currentNode.endpoint;
                localNode.rpcAddress = $scope.currentNode.address;

                $scope.clusterModel.locations = response.data.map((loc) => {
                    return {
                        isLocal: loc.local,
                        endpoint: loc.uri,
                        rpcAddress: loc.rpcAddress || ''
                    };
                });
            })
            .catch(function (error) {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    }

    function getRemoteLocationsRpcAddresses(locations) {
        const rpcAddressFetchers = locations.filter((location) => !location.isLocal).map((location) => {
            return getNodeRpcAddress(location.endpoint)
                .then((response) => {
                    location.rpcAddress = response.data;
                    location.isAvailable = true;
                })
                .catch((error) => {
                    location.isAvailable = false;
                    location.error = error.data;
                });
        });
        return Promise.allSettled(rpcAddressFetchers);
    }

    function getNodeRpcAddress(remoteLocation) {
        return LocationsRestService.getLocationRpcAddress(remoteLocation);
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

CreateClusterCtrl.$inject = ['$scope', '$modalInstance', '$timeout', 'ClusterRestService', 'toastr', '$translate', 'data', '$modal',
    'LocationsRestService'];

function CreateClusterCtrl($scope, $modalInstance, $timeout, ClusterRestService, toastr, $translate, data, $modal, LocationsRestService) {
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

    $scope.locations = data.clusterModel.locations.filter((location) => !location.isLocal);
    $scope.selectedLocations = data.clusterModel.locations.filter((location) => location.isLocal);

    $scope.loader = false;

    $scope.getAdvancedOptionsClass = getAdvancedOptionsClass;

    $scope.createCluster = function () {
        $scope.setLoader(true, $translate.instant('cluster_management.cluster_page.creating_cluster_loader'));
        $scope.clusterConfiguration.nodes = $scope.selectedLocations.map((node) => node.rpcAddress);
        return ClusterRestService.createCluster($scope.clusterConfiguration)
            .then(() => {
                toastr.success($translate.instant('cluster_management.cluster_page.notifications.create_success'));
                $modalInstance.close();
            })
            .catch(function (error) {
                handleErrors(error.data, error.status);
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
        $scope.selectedLocations.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.addLocation = function () {
        let newLocationData;
        $modal.open({
            templateUrl: 'js/angular/templates/modal/add-location.html',
            windowClass: 'addLocationDialog',
            controller: 'AddLocationCtrl'
        }).result
            .then((dataAddLocation) => {
                newLocationData = dataAddLocation;
                return $scope.addLocationHttp(dataAddLocation);
            })
            .then((response) => {
                if (!response) {
                    return;
                }
                newLocationData.rpcAddress = response;
            });
    };

    $scope.addLocationHttp = function (dataAddLocation) {
        $scope.loader = true;
        return LocationsRestService.addLocation(dataAddLocation)
            .then(() => {
                const location = {
                    isLocal: dataAddLocation.local,
                    endpoint: dataAddLocation.uri
                };
                $scope.locations.push(location);
                return LocationsRestService.getLocationRpcAddress(dataAddLocation.uri);
            })
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            })
            .finally(() => $scope.loader = false);
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

AddLocationCtrl.$inject = ['$scope', '$modalInstance', 'toastr', 'productInfo', '$translate'];

function AddLocationCtrl($scope, $modalInstance, toastr, productInfo, $translate) {
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
        $modalInstance.close($scope.newLocation);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}

const getDocBase = function (productInfo) {
    return `https://graphdb.ontotext.com/documentation/${productInfo.productShortVersion}/${productInfo.productType}`;
};
