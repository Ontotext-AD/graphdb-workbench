import 'angular/rest/cluster.rest.service';
import 'angular/clustermanagement/services/remote-locations.service';

angular
    .module('graphdb.framework.clustermanagement.controllers.replace-nodes', [])
    .controller('ReplaceNodesDialogCtrl', ReplaceNodesDialogCtrl);

ReplaceNodesDialogCtrl.$inject = ['$scope', '$uibModalInstance', '$timeout', 'toastr', '$translate', 'data', '$uibModal', '$rootScope', 'RemoteLocationsService'];

function ReplaceNodesDialogCtrl($scope, $uibModalInstance, $timeout, toastr, $translate, data, $uibModal, $rootScope, RemoteLocationsService) {
    const clusterConfiguration = _.cloneDeep(data.clusterConfiguration);
    const clusterModel = _.cloneDeep(data.clusterModel);
    // Nodes to be used as replacements
    $scope.replacementNodes = [];
    // Nodes from the cluster which should be replaced
    $scope.nodesToReplace = [];
    // The count of the nodes to be replaced
    $scope.nodesToReplaceCount = 0;
    // If selected to be replaced cluster nodes are majority of all nodes or not.
    $scope.leftNodesMajority = false;

    $scope.clusterNodes = clusterModel.nodes.map((node) => ({rpcAddress: node.address, endpoint: node.endpoint, shouldReplace: false}));
    $scope.locations = clusterModel.locations.filter((location) => !clusterConfiguration.nodes.includes(location.rpcAddress));
    $scope.locations.forEach((location) => location.isNew = true);

    $scope.addLocation = () => {
        RemoteLocationsService.addLocation()
            .then((newLocation) => {
                if (newLocation) {
                    $scope.locations.push(newLocation);
                }
            });
    };

    $scope.toggleNode = (index, selectedNode) => {
        selectedNode.shouldReplace = !selectedNode.shouldReplace;
        if (selectedNode.shouldReplace) {
            $scope.nodesToReplaceCount++;
            $scope.nodesToReplace.push(selectedNode);
        } else {
            $scope.nodesToReplaceCount--;
            const nodeIndex = $scope.nodesToReplace.findIndex((node) => node.rpcAddress === selectedNode.rpcAddress);
            $scope.nodesToReplace.splice(nodeIndex, 1);
        }
        $scope.leftNodesMajority = calculateClusterNodesMajorityCount() + $scope.nodesToReplaceCount > $scope.clusterNodes.length;
    };

    $scope.permitNodesReplace = () => {
        return !$scope.leftNodesMajority && $scope.nodesToReplace.length > 0 && $scope.replacementNodes.length > 0;
    };

    $scope.addNodeToList = (location) => {
        if (!location.rpcAddress) {
            return;
        }
        $scope.replacementNodes.push(location);
        $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint);
    };

    $scope.deleteLocation = (event, location) => {
        event.preventDefault();
        event.stopPropagation();
        data.deleteLocation(location).then(() => $scope.locations = $scope.locations.filter((loc) => loc.endpoint !== location.endpoint));
    };

    $scope.removeNodeFromList = (index, node) => {
        $scope.replacementNodes.splice(index, 1);
        $scope.locations.push(node);
    };

    $scope.ok = () => {
        $uibModalInstance.close({newNodes: $scope.replacementNodes, oldNodes: $scope.nodesToReplace});
    };

    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    // Private functions

    const calculateClusterNodesMajorityCount = () => {
        return Math.floor($scope.clusterNodes.length / 2) + 1;
    };
}
