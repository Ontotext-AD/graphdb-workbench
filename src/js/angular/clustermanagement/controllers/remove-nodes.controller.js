angular
    .module('graphdb.framework.clustermanagement.controllers.remove-nodes', [])
    .controller('RemoveNodesDialogCtrl', RemoveNodesDialogCtrl);

RemoveNodesDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

function RemoveNodesDialogCtrl($scope, $uibModalInstance, data) {
    const clusterModel = _.cloneDeep(data.clusterModel);

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
