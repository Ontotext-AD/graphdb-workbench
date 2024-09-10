import 'angular/clustermanagement/services/cluster-context.service';

const modules = [
    'graphdb.framework.clustermanagement.services.cluster-context'
];

angular
    .module('graphdb.framework.clustermanagement.controllers.update-cluster-group', modules)
    .controller('UpdateClusterGroupDialogCtrl', UpdateClusterGroupDialogCtrl);

UpdateClusterGroupDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'data', 'ClusterContextService'];

function UpdateClusterGroupDialogCtrl($scope, $uibModalInstance, data, ClusterContextService) {
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
        $uibModalInstance.dismiss('cancel');
    };

    // =========================
    // Private functions
    // =========================
    const onClusterValidityChanged = (isValid) => {
        $scope.isValid = isValid;
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
    $scope.$on('$destroy', removeAllListeners);

    // =========================
    // Initialization
    // =========================
    ClusterContextService.setClusterView(data.clusterModel);
}
