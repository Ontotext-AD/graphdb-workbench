angular
    .module('graphdb.framework.rest.cluster.service', [])
    .factory('ClusterRestService', ClusterRestService);

ClusterRestService.$inject = ['$http'];

function ClusterRestService($http) {
    return {
        getMaster,
        configureMaster,
        cloneRepository,
        connectWorker,
        disconnectWorker,
        disconnectNodes,
        connectNodes
    };

    function getMaster(masterRepositoryID, data = {}) {
        return $http.get(`rest/cluster/masters/${masterRepositoryID}`, data);
    }

    function configureMaster(master, location, data) {
        return $http({
            url: `rest/cluster/masters/${master}?masterLocation=${encodeURIComponent(location)}`,
            method: 'POST',
            data
        });
    }

    function cloneRepository(data) {
        return $http.post('rest/cluster/nodes/clone', {
            cloningNodeLocation: data.currentNodeLocation,
            cloningNodeRepositoryID: data.selectedNodeName,
            newNodeRepositoryID: data.repositoryID,
            newNodeLocation: data.locationUri,
            newNodeTitle: data.repositoryTitle
        })
    }

    function connectWorker(master, masterLocation, workerLocation) {
        return $http({
            url: `rest/cluster/masters/${master}/workers/`,
            method: 'POST',
            data: {
                workerURL: workerLocation,
                masterLocation: masterLocation
            }
        })
    }

    function disconnectWorker(master, params) {
        return $http({
            url: `rest/cluster/masters/${master}/workers?${params}`,
            method: 'DELETE',
            dataType: 'text'
        });
    }

    function disconnectNodes(master, params) {
        return $http({
            url: `rest/cluster/masters/${master}/peers?${params}`,
            method: 'DELETE',
            dataType: 'text'
        });
    }

    function connectNodes(master, data) {
        return $http({
            url: 'rest/cluster/masters/' + firstConfigs[1] + '/peers',
            method: 'POST',
            data
        });
    }
}
