import 'angular/core/directives/ascii-validator.directive';
import 'angular/core/directives/length-validator.directive';
import {ClusterConfiguration, ClusterModel} from "../../../models/clustermanagement/cluster";
import {NodeState, TopologyState} from "../../../models/clustermanagement/states";

const modules = [
    'graphdb.framework.core.directives.ascii-validator',
    'graphdb.framework.core.directives.length-validator'
];

const TagLengthConstraints = {
    minLen: '3',
    maxLen: '255'
};

angular
    .module('graphdb.framework.clustermanagement.directives.cluster-configuration.multi-region', modules)
    .directive('multiRegion', MultiRegion);

MultiRegion.$inject = ['$jwtAuth', '$translate', '$timeout', 'toastr', 'ModalService', 'ClusterRestService', 'ClusterViewContextService'];

function MultiRegion($jwtAuth, $translate, $timeout, toastr, ModalService, ClusterRestService, ClusterViewContextService) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-configuration/multi-region.html',
        scope: {
            clusterModel: '=',
            clusterConfiguration: '='
        },
        link: ($scope) => {
            // =========================
            // Private variables
            // =========================
            const subscriptions = [];

            // =========================
            // Public variables
            // =========================
            /**
             * @type {TopologyStatus}
             */
            $scope.topology = undefined;
            $scope.TopologyState = TopologyState;
            $scope.isAdmin = false;
            $scope.addingTag = false;
            $scope.loaderTimeout = undefined;
            $scope.secondaryTag = undefined;
            $scope.TagLengthConstraints = TagLengthConstraints;

            // =========================
            // Public functions
            // =========================
            $scope.add = () => {
                $scope.addingTag = true;
            };

            $scope.cancel = () => {
                $scope.addingTag = false;
            };

            $scope.createTag = (tag) => {
                const payload = {
                    tag
                };
                setLoader(true);
                return ClusterRestService.addCusterTag(payload)
                    .then(() => {
                        toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.created_tag', {tag}));
                    }).catch((response) => {
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.creating'));
                    }).finally(() => {
                        $scope.addingTag = false;
                        setLoader(false);
                    });
            };

            $scope.deleteTag = (tag) => {
                ModalService.openSimpleModal({
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.delete', {tag}),
                    message: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.warning'),
                    warning: true,
                    backdrop: 'static',
                    stopPropagation: true
                }).result
                    .then(() => {
                        setLoader(true);
                        return ClusterRestService.deleteClusterTag(tag);
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.deleted_tag', {tag})))
                    .catch((response) => {
                        if (response === 'cancel' || response === 'escape key press') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.deleting'));
                    })
                    .finally(() => setLoader(false));
            };

            $scope.enableSecondaryMode = () => {
                $scope.addingTag = false;
                const confirmConfig = {
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.enable_secondary'),
                    message: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.enable_secondary_warning'),
                    warning: true,
                    backdrop: 'static',
                    confirmButtonKey: 'common.ok.btn',
                    stopPropagation: true
                };

                ModalService.openSimpleModal(confirmConfig).result
                    .then(() => openSecondaryModeModal())
                    .then((payload) => {
                        setLoader(true);
                        return ClusterRestService.enableSecondaryMode(payload);
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.secondary_enabled')))
                    .catch((response) => {
                        if (response === 'cancel' || response === 'escape key press') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.secondary'));
                    })
                    .finally(() => setLoader(false));
            };

            $scope.disableSecondaryMode = () => {
                ModalService.openSimpleModal({
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.disable_secondary_mode'),
                    message: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.disable_secondary_mode_warning'),
                    warning: true,
                    backdrop: 'static',
                    stopPropagation: true
                }).result
                    .then(() => {
                        setLoader(true);
                        return ClusterRestService.disableSecondaryMode();
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.disabled_secondary_mode')))
                    .catch((response) => {
                        if (response === 'cancel' || response === 'escape key press') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.disabling'));
                    })
                    .finally(() => setLoader(false));
            };

            // =========================
            // Private functions
            // =========================
            const setTopology = (clusterModel) => {
                const leader = clusterModel.nodes.find((node) => node.nodeState === NodeState.LEADER);
                $scope.topology = leader.topologyStatus;
            };

            const openSecondaryModeModal = () => {
                const secondaryModalConfig = {
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.secondary_cluster_settings'),
                    templateUrl: 'js/angular/clustermanagement/templates/modal/secondary-mode-modal.html',
                    controller:  ['$scope', '$uibModalInstance', 'config', secondaryModeModalController],
                    size: 'lg',
                    warning: true,
                    backdrop: 'static'
                };

                return ModalService.openCustomModal(secondaryModalConfig).result;

                // Controller for the secondary mode modal
                function secondaryModeModalController($scope, $uibModalInstance, config) {
                    $scope.rpcAddress = '';
                    $scope.tag = '';
                    $scope.title = config.title;

                    $scope.onClick = ($event) => $event.stopPropagation();
                    $scope.ok = () => {
                        $uibModalInstance.close({
                            primaryNode: $scope.rpcAddress,
                            tag: $scope.tag
                        });
                    };
                    $scope.cancel = () => {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            };

            const updateClusterData = (clusterModel) => {
                setLoader(true);
                ClusterRestService.getClusterConfig()
                    .then((response) => {
                        $scope.secondaryTag = ClusterConfiguration.fromJSON(response.data).secondaryTag;
                        setTopology(ClusterModel.fromJSON(clusterModel));
                    }).catch((response) => {
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.disabling'));
                    })
                    .finally(() => setLoader(false));
            };

            const handleClusterConfigurationPanelVisibility = (show) => {
                if (!show) {
                    $scope.addingTag = false;
                }
            };

            const setLoader = (loader, message) => {
                $timeout.cancel($scope.loaderTimeout);
                if (loader) {
                    $scope.loaderMessage = message;
                    $scope.loaderTimeout = $timeout(() => {
                        $scope.loader = loader;
                    }, 150);
                } else {
                    $scope.loader = false;
                }
            };

            // =========================
            // Events and watchers
            // =========================
            const subscribeHandlers = () => {
                subscriptions.push($scope.$watch('clusterModel', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        updateClusterData(newValue);
                    }
                }, true));
                subscriptions.push(ClusterViewContextService.onShowClusterConfigurationPanel(handleClusterConfigurationPanelVisibility));
            };

            const removeAllListeners = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            $scope.$on('$destroy', function () {
                removeAllListeners();
            });

            // =========================
            // Initialization
            // =========================
            const init = () => {
                $scope.isAdmin = $jwtAuth.isAuthenticated() && $jwtAuth.isAdmin();
                subscribeHandlers();
                updateClusterData($scope.clusterModel);
            };
            init();
        }
    };
}
