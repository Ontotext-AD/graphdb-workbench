import 'angular/clustermanagement/services/cluster-context.service';

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
     */
    $scope.ok = () => {
        $uibModalInstance.close(ClusterContextService.getClusterView());
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
     * Unsubscribes from all listeners when the scope is destroyed.
     */
    function removeAllListeners() {
        subscriptions.forEach((subscription) => subscription());
    }

    subscriptions.push(ClusterContextService.onClusterValidityChanged(onClusterValidityChanged));
    subscriptions.push(ClusterContextService.onClusterViewChanged(onClusterViewChanged));
    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================
    ClusterContextService.setClusterView(data.clusterModel);
    $scope.hasCluster = data.clusterModel.hasCluster;
}
