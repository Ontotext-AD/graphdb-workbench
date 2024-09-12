import {Location} from "../../models/clustermanagement/cluster";

const modules = [];
angular.module('graphdb.framework.clustermanagement.directives.cluster-list', modules)
    .directive('clusterList', ClusterListComponent);

ClusterListComponent.$inject = ['$translate', '$timeout', '$repositories', 'productInfo', 'toastr', 'RemoteLocationsService', 'ClusterContextService', 'ModalService'];

function ClusterListComponent($translate, $timeout, $repositories, productInfo, toastr, RemoteLocationsService, ClusterContextService, ModalService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-list.html',
        link: ($scope, element, attrs) => {
            // =========================
            // Private variables
            // =========================
            const subscriptions = [];

            // =========================
            // Public variables
            // =========================
            $scope.rowHeights = {};
            $scope.editedNodeIndex = undefined;
            $scope.allSuggestions = [];
            $scope.loader = false;
            $scope.cluster = undefined;
            $scope.clusterView = undefined;
            $scope.errors = [];
            $scope.newLocation = '';

            /**
             * Adds a new (empty) node to the list of cluster nodes for editing.
             */
            $scope.addNode = () => {
                $scope.clusterView.push({});
                $scope.editedNodeIndex = $scope.clusterView.length - 1;
            };

            /**
             * Filters suggestions based on user input for node's endpoint.
             * @param {Object} node - The node object with an endpoint property.
             */
            $scope.filterSuggestions = (node) => {
                const query = node.endpoint && node.endpoint.toLowerCase();
                if (query) {
                    $scope.suggestions = $scope.allSuggestions.filter((item) => item.toLowerCase().includes(query));
                    $scope.showDropdown = true;
                } else {
                    $scope.suggestions = [];
                    $scope.showDropdown = false;
                }
            };

            /**
             * Selects a suggestion from the dropdown and updates the node's endpoint.
             * @param {Object} node - The node object to update.
             * @param {string} suggestion - The selected suggestion for the node's endpoint.
             */
            $scope.selectSuggestion = (node, suggestion) => {
                node.endpoint = suggestion;
                $scope.suggestions = [];
                $scope.showDropdown = false;
            };

            /**
             * Hides the suggestions dropdown after a timeout, used after user selection or clicking away.
             */
            $scope.hideSuggestions = () => {
                $timeout(() => {
                    $scope.showDropdown = false;
                }, 200);
            };

            /**
             * Saves a node to the cluster based on the provided endpoint.
             * If the node is found in the cluster deletion list, it is restored.
             * If the node is available in the cluster, it is added.
             * Otherwise, a new location is created and added.
             *
             * @param {string} endpoint - The endpoint of the node to save.
             */
            $scope.saveNode = (endpoint) => {
                const deleteList = $scope.cluster.getDeleteFromCluster();
                const deletedNode = $scope.cluster.findByEndpoint(deleteList, endpoint);
                if (deletedNode) {
                    ClusterContextService.restoreNode(deletedNode);
                    $scope.editedNodeIndex = undefined;
                    return;
                }

                const availableList = $scope.cluster.getAvailable();
                const node = $scope.cluster.findByEndpoint(availableList, endpoint);
                if (node) {
                    ClusterContextService.addLocation(node);
                    $scope.editedNodeIndex = undefined;
                    return;
                }

                const newLocation = RemoteLocationsService.createNewLocation(endpoint);
                $scope.setLoader(true, $translate.instant('cluster_management.update_cluster_group_dialog.messages.connecting_node'));

                RemoteLocationsService.addLocationHttp(newLocation)
                    .then((location) => {
                        if (location.error) {
                            handleErrors(location.error);
                            ClusterContextService.emitUpdateClusterView();
                            return;
                        }
                        if (location) {
                            ClusterContextService.addLocation(Location.fromJSON(location));
                        }
                    })
                    .catch(function (error) {
                        handleErrors(error.data, error.status);
                        ClusterContextService.emitUpdateClusterView();
                    })
                    .finally(() => {
                        $scope.editedNodeIndex = undefined;
                        $scope.setLoader(false);
                    });
            };

            /**
             * Deletes a node from the cluster.
             * @param {number} index - The index of the node to delete.
             * @param {Node|Location} item - The item to delete.
             * @return {void}
             */
            $scope.deleteNode = (index, item) => {
                ModalService.openSimpleModal({
                    title: $translate.instant('location.confirm.detach'),
                    message: $translate.instant('location.confirm.detach.warning', {uri: item.endpoint}),
                    warning: true
                }).result.then(() =>{
                    ClusterContextService.deleteFromCluster(item);
                });
            };

            /**
             * Checks if the current cluster configuration is valid.
             * The configuration is considered valid if there are at least two nodes and no nodes are being edited.
             * @return {boolean} True if the configuration is valid, false otherwise.
             */
            $scope.isClusterConfigurationValid = () => {
                const isNotInEditMode = $scope.editedNodeIndex === undefined;
                const validNodes = $scope.cluster.getViewModel().filter((node) => node.endpoint && node.endpoint.length > 0);
                const hasValidNodes = validNodes.length >= 2;
                return isNotInEditMode && hasValidNodes;
            };

            /**
             * Sets the loader state with a message.
             * The loader state is shown with a delay to avoid flickering for short operations.
             * @param {boolean} loader - Whether to show the loader.
             * @param {string} [message] - The message to show with the loader.
             */
            $scope.setLoader = (loader, message) => {
                $timeout.cancel($scope.loaderTimeout);
                if (loader) {
                    $scope.loaderTimeout = $timeout(() => {
                        $scope.loader = loader;
                        $scope.loaderMessage = message;
                    }, 300);
                } else {
                    $scope.loader = false;
                }
            };

            // =========================
            // Private functions
            // =========================
            const onClusterViewChanged = (cluster) => {
                $scope.cluster = cluster;
                $scope.clusterView = cluster.getAttached();
                $scope.allSuggestions = cluster.getAvailableNodeEndpoints();

                // If there are no cluster nodes, add the local node
                if ($scope.clusterView.length === 0) {
                    const localNode = $scope.locations.find((location) => location.isLocal);
                    if (localNode) {
                        $scope.saveNode(localNode.endpoint, 0);
                    }
                }
            };

            const handleErrors = (data, status) => {
                let failMessage;
                $scope.errors.splice(0);
                if (status === 400) {
                    $scope.errors.push(...data);
                } else if (status === 409) {
                    $scope.errors.push(data);
                } else if (data.message || typeof data === 'string') {
                    failMessage = data.message || data;
                }
                toastr.error(failMessage, $translate.instant('cluster_management.cluster_page.notifications.create_failed'));
            };

            // =========================
            // Subscriptions
            // =========================

            /**
             * Removes all listeners and unsubscribes from events when the directive is destroyed.
             */
            function removeAllListeners() {
                subscriptions.forEach((subscription) => subscription());
            }

            const unwatch = $scope.$watchGroup(['clusterNodes', 'editedNodeIndex'], function (newValues, oldValues) {
                const isValid = $scope.isClusterConfigurationValid();
                ClusterContextService.updateClusterValidity(isValid);
            });

            subscriptions.push(unwatch);
            subscriptions.push(ClusterContextService.onClusterViewChanged(onClusterViewChanged));
            $scope.$on('$destroy', removeAllListeners);
        }
    };
}
