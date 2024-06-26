angular
    .module('graphdb.framework.clustermanagement.controllers.delete-cluster', [])
    .controller('DeleteClusterCtrl', DeleteClusterCtrl);

DeleteClusterCtrl.$inject = ['$scope', '$uibModalInstance'];

function DeleteClusterCtrl($scope, $uibModalInstance) {
    $scope.forceDelete = false;

    $scope.ok = () => {
        $uibModalInstance.close($scope.forceDelete);
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.onClick = ($event) => {
        $event.stopPropagation();
    };
}
