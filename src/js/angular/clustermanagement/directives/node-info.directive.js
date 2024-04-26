import {createSingleHexagon} from "../services/cluster-drawing.service";

angular
    .module('graphdb.framework.clustermanagement.directives.node-info', [])
    .directive('nodeInfo', nodeInfo);

function nodeInfo() {
    const directive = {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/node-info.html',
        scope: {
            currentNode: '=',
            nodeStatusInfo: '='
        },
        // link: linkFunc,
        controller: NodeInfoCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    // function linkFunc($scope) {
    //     $scope.node = $scope.currentNode;
    //     console.log(`node`, $scope.node);
    // }
}

NodeInfoCtrl.$inject = ['$scope', 'ClusterViewContextService'];

function NodeInfoCtrl($scope, ClusterViewContextService) {
    const vm = this;

    vm.closeNodeInfoPanel = () => {
        ClusterViewContextService.hideNodeInfoPanel();
    };

    const createNodeHexagons = () => {
        const nodeHexagons = vm.nodeStatusInfo.map((node, index) => {
            return createSingleHexagon(`.item .node-${index}`, 30);
        });
        console.log(`nodeHexagons`, nodeHexagons, vm.nodeStatusInfo);
    };

    const subscriptions = [];

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    $scope.$on('$destroy', function () {
        removeAllListeners();
    });

    const init = () => {
        console.log(`%cINIT:`, 'background: red', );
        subscriptions.push(ClusterViewContextService.onShowNodeInfoPanel((show) => {
            console.log(`%cOPENED:`, 'background: green', show);
        }));
        createNodeHexagons();
    };
    init();
}
