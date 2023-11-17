angular
    .module('graphdb.framework.rest.cluster.service', [])
    .factory('ClusterRestService', ClusterRestService);

ClusterRestService.$inject = ['$http'];

const CLUSTER_GROUP_ENDPOINT = 'rest/cluster';

function ClusterRestService($http) {
    return {
        getClusterConfig,
        createCluster,
        updateCluster,
        deleteCluster,
        addNodesToCluster,
        replaceNodesInCluster,
        removeNodesFromCluster,
        getClusterStatus,
        getNodeStatus
    };

    /**
     * Invokes service to replace nodes in a running cluster.
     * @param {{newNodes: string[], oldNodes: string[]}} payload
     * @return {*}
     */
    function replaceNodesInCluster(payload) {
        return $http.patch(`${CLUSTER_GROUP_ENDPOINT}/config/node`, payload);
    }

    function getClusterConfig() {
        return $http.get(`${CLUSTER_GROUP_ENDPOINT}/config`);
    }

    function createCluster(groupConfiguration) {
        return $http.post(`${CLUSTER_GROUP_ENDPOINT}/config`, groupConfiguration);
    }

    function updateCluster(groupConfiguration) {
        if (groupConfiguration.nodes) {
            delete groupConfiguration.nodes;
        }
        return $http.patch(`${CLUSTER_GROUP_ENDPOINT}/config`, groupConfiguration);
    }

    function deleteCluster(forceDelete) {
        const data = $.param({
            force: forceDelete
        });
        return $http.delete(`${CLUSTER_GROUP_ENDPOINT}/config?${data}`);
    }

    function addNodesToCluster(nodesArray) {
        return $http.post(`${CLUSTER_GROUP_ENDPOINT}/config/node`, {nodes: nodesArray});
    }

    function removeNodesFromCluster(nodesArray) {
        return $http.delete(`${CLUSTER_GROUP_ENDPOINT}/config/node`, {data: {nodes: nodesArray}, headers: {'Content-Type': 'application/json'}});
    }

    function getClusterStatus() {
        return $http.get(`${CLUSTER_GROUP_ENDPOINT}/group/status`);
    }

    function getNodeStatus() {
        return $http.get(`${CLUSTER_GROUP_ENDPOINT}/node/status`);
    }
}
