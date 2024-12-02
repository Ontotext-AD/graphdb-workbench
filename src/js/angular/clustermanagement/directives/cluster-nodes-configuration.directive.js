import {Location} from "../../models/clustermanagement/cluster";

const modules = [];
angular.module('graphdb.framework.clustermanagement.directives.cluster-nodes-configuration', modules)
    .directive('clusterNodesConfiguration', ClusterNodesConfigurationComponent);

ClusterNodesConfigurationComponent.$inject = ['$translate', '$timeout', 'productInfo', 'toastr', 'RemoteLocationsService', 'ClusterContextService', 'ModalService'];

function ClusterNodesConfigurationComponent($translate, $timeout, productInfo, toastr, RemoteLocationsService, ClusterContextService, ModalService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-nodes-configuration.html',
        link: ($scope) => {
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
            $scope.errors = [];
            $scope.addNewLocation = false;
            $scope.hasCluster = false;

            /**
             * Adds a new (empty) node to the list of cluster nodes for editing.
             */
            $scope.addNode = () => {
                $scope.addNewLocation = true;
                $scope.newLocation = new Location();
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
                const availableList = ClusterContextService.getAvailable(true);
                const node = ClusterContextService.findByEndpoint(availableList, endpoint) || new Location(endpoint);
                const oldNode = ClusterContextService.getPendingReplace();

                handleNodeSave(node, oldNode);
            };

            /**
             * Deletes a node from the cluster.
             * @param {number} index - The index of the node to delete.
             * @param {ClusterItemViewModel} itemView - The item to delete.
             * @return {void}
             */
            $scope.deleteNode = (index, itemView) => {
                ModalService.openSimpleModal({
                    title: $translate.instant('location.confirm.detach'),
                    message: $translate.instant('location.confirm.detach.warning', {uri: itemView.endpoint}),
                    warning: true
                }).result.then(() => {
                    ClusterContextService.deleteFromCluster(itemView.item);
                });
            };

            /**
             * Initiates the replacement of a node in the cluster view.
             * @param {number} index - The zero-based index of the node in the cluster view array that is to be replaced.
             * @param {ClusterItemViewModel} itemView - The node object representing the current state of the node to be replaced.
             * @return {void}
             */
            $scope.replaceNode = (index, itemView) => {
                ModalService.openSimpleModal({
                    title: $translate.instant('location.change.confirm'),
                    message: $translate.instant('location.change.confirm.warning'),
                    warning: true
                }).result.then(() => {
                    ClusterContextService.setPendingReplace(itemView.item);
                    $scope.editedNodeIndex = index;
                });
            };

            /**
             * Checks if the current cluster configuration is valid.
             * The configuration is considered valid if there are at least two nodes and no nodes are being edited.
             * @return {boolean} True if the configuration is valid, false otherwise.
             */
            $scope.isClusterConfigurationValid = () => {
                const isNotInEditMode = $scope.editedNodeIndex === undefined;
                const isNotInAddMode = $scope.addNewLocation === false;
                const hasValidNodes = ClusterContextService.hasValidNodesCount();
                const hasValidConfiguration = $scope.form.$valid;
                return isNotInEditMode && isNotInAddMode && hasValidNodes && hasValidConfiguration;
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

            /**
             * Determines the CSS class for the advanced options button based on its expanded state.
             *
             * @return {string} - Returns 'fa fa-angle-down' if the 'advancedOptions' element is expanded, otherwise 'fa fa-angle-right'.
             */
            $scope.getAdvancedOptionsClass = () => {
                const optionsModule = document.getElementById('advancedOptions');

                if (optionsModule) {
                    const isAriaExpanded = optionsModule.getAttribute('aria-expanded');
                    if (isAriaExpanded && isAriaExpanded === 'true') {
                        return 'fa fa-angle-down';
                    }
                }
                return 'fa fa-angle-right';
            };

            /**
             * Cancels the current action and resets the form state.
             *
             * @return {void}
             */
            $scope.cancel = () => {
                $scope.editedNodeIndex = undefined;
                $scope.addNewLocation = false;
                ClusterContextService.emitUpdateClusterView();
            };

            $scope.restoreNode = (node) => {
                ClusterContextService.restoreNode(node.item);
            };

            // =========================
            // Private functions
            // =========================
            /**
             * Handles the saving of an existing node in the cluster.
             * @param {Object} node - The node object found in the cluster.
             * @param {Object|null} oldNode - The old node that is being replaced (if any).
             */
            function handleNodeSave(node, oldNode) {
                if (oldNode) {
                    ClusterContextService.replace(oldNode, node);
                } else {
                    ClusterContextService.addLocation(node);
                }
                resetNodeEditState();
            }

            /**
             * Resets the state of the node edit operation.
             */
            const resetNodeEditState = () => {
                ClusterContextService.setPendingReplace(undefined);
                $scope.editedNodeIndex = undefined;
                $scope.addNewLocation = false;
            };

            const onClusterViewChanged = (cluster) => {
                $scope.hasCluster = ClusterContextService.hasCluster();
                $scope.viewModel = ClusterContextService.getViewModel();
                $scope.clusterNodesEndpoints = $scope.viewModel.map((node) => node.endpoint);
                $scope.clusterConfiguration = ClusterContextService.getClusterConfiguration();
                $scope.allSuggestions = ClusterContextService.getAvailableNodeEndpoints();
                $scope.canDeleteNode = ClusterContextService.canDeleteNode();
            };

            // =========================
            // Subscriptions
            // =========================

            /**
             * Removes all listeners and unsubscribes from events when the directive is destroyed.
             */
            const removeAllListeners = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            const unwatch = $scope.$watchGroup([
                'editedNodeIndex',
                'addNewLocation',
                'clusterConfiguration.electionMinTimeout',
                'clusterConfiguration.electionRangeTimeout',
                'clusterConfiguration.heartbeatInterval',
                'clusterConfiguration.messageSizeKB',
                'clusterConfiguration.verificationTimeout',
                'clusterConfiguration.transactionLogMaximumSizeGB'
            ], (newValues, oldValues) => {
                const isValid = $scope.isClusterConfigurationValid();
                ClusterContextService.updateClusterValidity(isValid);
            });

            subscriptions.push(unwatch);
            subscriptions.push(ClusterContextService.onClusterViewChanged(onClusterViewChanged));
            $scope.$on('$destroy', removeAllListeners);
        }
    };
}
