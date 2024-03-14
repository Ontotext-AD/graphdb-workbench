import 'angular/clustermanagement/services/remote-locations.service';

angular
    .module('graphdb.framework.clustermanagement.controllers.add-nodes', [])
    .controller('AddNodesDialogCtrl', AddNodesDialogCtrl);

AddNodesDialogCtrl.$inject = ['$scope', '$uibModalInstance', 'data', '$uibModal', 'RemoteLocationsService'];

function AddNodesDialogCtrl($scope, $uibModalInstance, data, $uibModal, RemoteLocationsService) {
    const clusterModel = _.cloneDeep(data.clusterModel);
    $scope.nodes = [];

    $scope.clusterNodes = clusterModel.nodes.map((node) => ({rpcAddress: node.address, endpoint: node.endpoint}));
    const clusterEndpoints = $scope.clusterNodes.map((node) => node.endpoint);
    $scope.locations = clusterModel.locations.filter((location) => !clusterEndpoints.includes(location.endpoint));
    $scope.locations.forEach((location) => location.isNew = true);

    $scope.deleteLocation = function (event, location) {
        event.preventDefault();
        event.stopPropagation();
        data.deleteLocation(location).then(() => $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint));
    };

    $scope.addNodeToList = function (location) {
        if (!location.rpcAddress) {
            return;
        }
        $scope.nodes.push(location);
        $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint);
    };

    $scope.removeNodeFromList = function (index, node) {
        $scope.nodes.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.addLocation = function () {
        RemoteLocationsService.addLocation()
            .then((newLocation) => {
                if (newLocation) {
                    $scope.locations.push(newLocation);
                }
            });
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.nodes);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
