import 'angular/clustermanagement/services/cluster-context.service';
import {cloneDeep} from "lodash";

const modules = [
    'graphdb.framework.clustermanagement.services.cluster-context'
];

angular
    .module('graphdb.framework.clustermanagement.controllers.edit-cluster-nodes-modal', modules)
    .controller('EditClusterNodesModalController', EditClusterNodesModalController);

EditClusterNodesModalController.$inject = ['$scope', '$uibModalInstance', '$translate', 'data', 'ClusterContextService', 'ModalService'];

function EditClusterNodesModalController($scope, $uibModalInstance, $translate, data, ClusterContextService, ModalService) {
    // =========================
    // Private variables
    // =========================
    const subscriptions = [];

    // =========================
    // Public variables
    // =========================
    $scope.isValid = ClusterContextService.isValid();

    /**
     * Confirms and saves the changes, closing the modal.
     *
     * This function is called when the user confirms their actions in the modal.
     *
     * It retrieves the current cluster view from `ClusterContextService`.
     *
     * If the cluster does not have a valid cluster configuration,
     * it closes the modal and passes a deep clone of the updated cluster configuration.
     *
     * If the cluster does have a valid configuration, it passes a deep clone of the full update actions.
     */
    $scope.ok = () => {
        const cluster = ClusterContextService.getClusterView();
        if (!cluster.hasCluster()) {
            $uibModalInstance.close(cloneDeep(cluster.getUpdateActions().clusterConfiguration));
        } else {
            $uibModalInstance.close(cloneDeep(cluster.getUpdateActions()));
        }
    };

    /**
     * Cancels the operation and dismisses the modal.
     */
    $scope.cancel = () => {
        if ($scope.isChanged) {
            ModalService.openSimpleModal({
                title: $translate.instant('common.warning'),
                message: $translate.instant('page.leave.pristine.warning'),
                warning: true
            }).result.then(() => {
                $uibModalInstance.dismiss('cancel');
            });
        } else {
            $uibModalInstance.dismiss('cancel');
        }
    };

    // =========================
    // Private functions
    // =========================
    const onClusterValidityChanged = (isValid) => {
        $scope.isValid = isValid;
    };

    const onClusterViewChanged = () => {
        if (!$scope.hasCluster && ClusterContextService.getAttached().length === 0) {
            const localNode = ClusterContextService.getLocalNode();
            ClusterContextService.addLocation(localNode);
        }
        $scope.isChanged = ClusterContextService.isChanged();
    };

    // =========================
    // Subscriptions
    // =========================

    /**
     * Cleanup function that is called when the modal is destroyed.
     * @private
     */
    const onDestroy = () => {
        removeAllListeners();
        ClusterContextService.setClusterView(undefined);
    };

    /**
     * Unsubscribes from all listeners when the scope is destroyed.
     */
    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    subscriptions.push(ClusterContextService.onClusterValidityChanged(onClusterValidityChanged));
    subscriptions.push(ClusterContextService.onClusterViewChanged(onClusterViewChanged));
    $scope.$on('$destroy', onDestroy);

    // =========================
    // Initialization
    // =========================
    ClusterContextService.setClusterView(data.clusterModel);
    $scope.hasCluster = data.clusterModel.hasCluster;
}
