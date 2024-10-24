import 'angular/core/directives/ascii-validator.directive';
import 'angular/core/directives/length-validator.directive';
import {ClusterModel} from "../../../models/clustermanagement/cluster";
import {NodeState, TopologyState} from "../../../models/clustermanagement/states";

const modules = [
    'graphdb.framework.core.directives.ascii-validator',
    'graphdb.framework.core.directives.length-validator'
];

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
            $scope.isAdmin = false;
            $scope.topology = undefined;
            $scope.addingTag = false;
            $scope.TopologyState = TopologyState;

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
                $scope.setLoader(true);
                return ClusterRestService.addCusterTag(payload)
                    .then(() => {
                        toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.created_tag', {tag}));
                    }).catch((response) => {
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.creating'));
                    }).finally(() => {
                        $scope.addingTag = false;
                        $scope.setLoader(false);
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
                        $scope.setLoader(true);
                        return ClusterRestService.deleteClusterTag(tag);
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.deleted_tag', {tag})))
                    .catch((response) => {
                        if (response === 'cancel') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.deleting'));
                    })
                    .finally(() => $scope.setLoader(false));
            };

            $scope.enableSecondaryMode = () => {
                ModalService.openSimpleModal({
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.enable_secondary'),
                    message: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.enable_secondary_warning'),
                    warning: true,
                    backdrop: 'static',
                    confirmButtonKey: 'common.ok.btn',
                    stopPropagation: true
                }).result.then(() => ModalService.openCustomModal({
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.secondary_cluster_settings'),
                    templateUrl: 'js/angular/clustermanagement/templates/modal/secondary-mode-modal.html',
                    controller: function($scope, $uibModalInstance, config) {
                        $scope.rpcAddress = '';
                        $scope.tag = '';
                        $scope.title = config.title;
                        $scope.onClick = ($event) => $event.stopPropagation();
                        $scope.ok = ($event) => {
                            $uibModalInstance.close({
                                primaryNode: $scope.rpcAddress,
                                tag: $scope.tag
                            });
                        };
                        $scope.cancel = function($event) {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: 'lg',
                    warning: true,
                    backdrop: 'static'
                }).result)
                    .then((payload) => {
                        $scope.setLoader(true);
                        return ClusterRestService.enableSecondaryMode(payload);
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.secondary_enabled')))
                    .catch((response) => {
                        if (response === 'cancel') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.secondary'));
                    })
                    .finally(() => $scope.setLoader(false));
            };

            $scope.disableSecondaryMode = () => {
                $scope.setLoader(true);
                ModalService.openSimpleModal({
                    title: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.disable_secondary_mode'),
                    message: $translate.instant('cluster_management.cluster_configuration_multi_region.confirm.disable_secondary_mode_warning'),
                    warning: true,
                    backdrop: 'static',
                    stopPropagation: true
                }).result
                    .then(() => {
                        $scope.setLoader(true);
                        return ClusterRestService.disableSecondaryMode();
                    })
                    .then(() => toastr.success($translate.instant('cluster_management.cluster_configuration_multi_region.disabled_secondary_mode')))
                    .catch((response) => {
                        if (response === 'cancel') {
                            return;
                        }
                        const msg = getError(response);
                        toastr.error(msg, $translate.instant('cluster_management.cluster_configuration_multi_region.error.disabling'));
                    })
                    .finally(() => $scope.setLoader(false));
            };

            $scope.setLoader = (loader, message) => {
                $timeout.cancel($scope.loaderTimeout);
                if (loader) {
                    $scope.loaderMessage = message;
                    $scope.loaderTimeout = $timeout(() => {
                        $scope.loader = loader;
                    }, 50);
                } else {
                    $scope.loader = false;
                }
            };

            // =========================
            // Private functions
            // =========================
            const setTopology = (clusterModel) => {
                const leader = clusterModel.nodes.find((node) => node.nodeState === NodeState.LEADER);
                $scope.topology = leader.topologyStatus;
            };

            // =========================
            // Events and watchers
            // =========================
            const subscribeHandlers = () => {
                subscriptions.push($scope.$watch('clusterModel', function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        ClusterRestService.getClusterConfig()
                            .then((response) => {
                                $scope.secondaryTag = response.data.secondaryTag;
                                setTopology(ClusterModel.fromJSON(newValue));
                            });
                    }
                }, true));
                subscriptions.push(ClusterViewContextService.onShowClusterConfigurationPanel((show) => {
                    if (!show) {
                        $scope.addingTag = false;
                    }
                }));
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
                setTopology(ClusterModel.fromJSON($scope.clusterModel));
                $scope.secondaryTag = $scope.clusterConfiguration.secondaryTag;
            };
            init();
        }
    };
}
