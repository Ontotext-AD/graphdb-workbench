angular
    .module('graphdb.framework.clustermanagement.services.cluster-view-context-service', [])
    .factory('ClusterViewContextService', ClusterViewContextService);

ClusterViewContextService.$inject = ['EventEmitterService'];

function ClusterViewContextService(EventEmitterService) {
    let _showClusterConfigurationPanel = false;
    let _clusterViewD3Container;

    function getShowClusterConfigurationPanel() {
        return _showClusterConfigurationPanel;
    }

    function setShowClusterConfigurationPanel(showClusterConfigurationPanel) {
        _showClusterConfigurationPanel = showClusterConfigurationPanel;
        EventEmitterService.emit('showClusterConfigurationPanel', getShowClusterConfigurationPanel());
    }

    function showClusterConfigurationPanel() {
        setShowClusterConfigurationPanel(true);
    }

    function hideClusterConfigurationPanel() {
        setShowClusterConfigurationPanel(false);
    }

    function onShowClusterConfigurationPanel(callback) {
        return EventEmitterService.subscribe('showClusterConfigurationPanel', () => callback(getShowClusterConfigurationPanel()));
    }

    function getClusterViewD3Container() {
        return _clusterViewD3Container;
    }

    function onClusterViewD3ContainerUpdated(callback) {
      return EventEmitterService.subscribe('clusterViewD3ContainerChanged', () => callback(getClusterViewD3Container()));
    }

    function updateClusterViewD3Container(clusterViewD3Container) {
        _clusterViewD3Container = clusterViewD3Container;
        EventEmitterService.emit('clusterViewD3ContainerChanged', getClusterViewD3Container());
    }

    return {
        updateClusterViewD3Container,
        getClusterViewD3Container,
        onClusterViewD3ContainerUpdated,
        getShowClusterConfigurationPanel,
        setShowClusterConfigurationPanel,
        showClusterConfigurationPanel,
        hideClusterConfigurationPanel,
        onShowClusterConfigurationPanel
    };
}
