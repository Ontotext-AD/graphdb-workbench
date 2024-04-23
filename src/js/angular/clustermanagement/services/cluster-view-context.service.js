angular
    .module('graphdb.framework.clustermanagement.services.cluster-view-context-service', [])
    .factory('ClusterViewContextService', ClusterViewContextService);

ClusterViewContextService.$inject = ['EventEmitterService'];

function ClusterViewContextService(EventEmitterService) {
    let _showClusterConfigurationPanel = false;
    let _showNodeInfoPanel = false;

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

    function getShowNodeInfoPanel() {
        return _showNodeInfoPanel;
    }

    function setShowNodeInfoPanel(showNodeInfoPanel) {
        _showNodeInfoPanel = showNodeInfoPanel;
        EventEmitterService.emit('showNodeInfoPanel', getShowNodeInfoPanel());
    }

    function showNodeInfoPanel() {
         setShowNodeInfoPanel(true);
    }

    function hideNodeInfoPanel() {
        setShowNodeInfoPanel(false);
    }

    function onShowNodeInfoPanel(callback) {
        return EventEmitterService.subscribe('showNodeInfoPanel', () => callback(getShowNodeInfoPanel()));
    }

    return {
        getShowClusterConfigurationPanel,
        setShowClusterConfigurationPanel,
        showClusterConfigurationPanel,
        hideClusterConfigurationPanel,
        onShowClusterConfigurationPanel,
        getShowNodeInfoPanel,
        setShowNodeInfoPanel,
        showNodeInfoPanel,
        hideNodeInfoPanel,
        onShowNodeInfoPanel
    };
}
