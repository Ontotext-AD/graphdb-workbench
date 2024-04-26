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
        getNodeStatus,
        getNodeStatusHistory
    };

    /**
     * Invokes service to replace nodes in a running cluster.
     * @param {{addNodes: string[], removeNodes: string[]}} payload
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

    function getNodeStatusHistory() {
        return Promise.resolve({
            data: [
                {"address": "svelikov-desktop:7300", "status": "IN_SYNC", "message": "In sync", "timestamp": "1664716800000"},
                {"address": "svelikov-desktop:7300", "status": "REQUESTING_SNAPSHOT", "message": "Requesting snapshot", "timestamp": "1664713200000"},
                {"address": "svelikov-desktop:7300", "status": "SEARCHING", "message": "Searching", "timestamp": "1664709600000"},
                {"address": "svelikov-desktop:7300", "status": "OUT_OF_SYNC", "message": "Out of sync", "timestamp": "1664706000000"},
                {"address": "svelikov-desktop:7300", "status": "IN_SYNC", "message": "In sync", "timestamp": "1664702400000"}
            ]
        });
    }
}
