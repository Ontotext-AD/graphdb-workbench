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
        removeNodesFromCluster,
        getClusterStatus,
        getNodeStatus
    };

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
        return $http.post(`${CLUSTER_GROUP_ENDPOINT}/config/node`, nodesArray);
    }

    function removeNodesFromCluster(nodesArray) {
        return $http.delete(`${CLUSTER_GROUP_ENDPOINT}/config/node`, nodesArray);
    }

    function getClusterStatus() {
        return $http.get(`${CLUSTER_GROUP_ENDPOINT}/group/status`);
    }

    function getNodeStatus() {
        return $http.get(`${CLUSTER_GROUP_ENDPOINT}/node/status`);
    }
}
