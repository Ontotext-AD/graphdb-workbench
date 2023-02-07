angular
    .module('graphdb.framework.rest.monitoring.service', [])
    .factory('MonitoringRestService', MonitoringRestService);

MonitoringRestService.$inject = ['$http'];

const MONITORING_ENDPOINT = 'rest/monitor';
const QUERY_MONITORING_ENDPOINT = `${MONITORING_ENDPOINT}/repository`;

function MonitoringRestService($http) {
    return {
        monitorResources,
        monitorStructures,
        monitorCluster,
        monitorGC,
        monitorQuery,
        deleteQuery,
        getQueryCount,
        checkAutocompleteStatus,
        monitorQueryTransactionStatistics
    };

    function monitorResources() {
        return $http({
            url: `${MONITORING_ENDPOINT}/infrastructure`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });
    }

    function monitorStructures() {
        return $http({
            url: `${MONITORING_ENDPOINT}/structures`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });
    }

    function monitorCluster() {
        return $http({
            url: `${MONITORING_ENDPOINT}/cluster`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });
    }

    function monitorQueryTransactionStatistics(repositoryID) {
        return $http({
            url: `${QUERY_MONITORING_ENDPOINT}/${repositoryID}`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });
    }

    function monitorGC() {
        return $http.post(`${MONITORING_ENDPOINT}/infrastructure/gc`);
    }

    function monitorQuery(repositoryID) {
        return $http({
            url: `${QUERY_MONITORING_ENDPOINT}/${repositoryID}/query/active`,
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });
    }

    function deleteQuery(queryId, repositoryID) {
        return $http.delete(`${QUERY_MONITORING_ENDPOINT}/${repositoryID}/query?query=${encodeURIComponent(queryId)}`);
    }

    function getQueryCount(repositoryID) {
        return $http({
            url: `${QUERY_MONITORING_ENDPOINT}/${repositoryID}/query/count`,
            method: 'GET',
            timeout: 10000
        });
    }

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }
}
