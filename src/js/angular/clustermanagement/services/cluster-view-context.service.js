angular
    .module('graphdb.framework.clustermanagement.services.cluster-view-context-service', [])
    .factory('ClusterViewContextService', ClusterViewContextService);

ClusterViewContextService.$inject = ['EventEmitterService'];

function ClusterViewContextService(EventEmitterService) {
    let _showClusterConfigurationPanel = false;

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

    return {
        getShowClusterConfigurationPanel,
        setShowClusterConfigurationPanel,
        showClusterConfigurationPanel,
        hideClusterConfigurationPanel,
        onShowClusterConfigurationPanel
    };
}
