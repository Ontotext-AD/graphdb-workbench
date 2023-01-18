angular
    .module('graphdb.framework.rest.monitoring.service', [])
    .factory('MonitoringRestService', MonitoringRestService);

MonitoringRestService.$inject = ['$http'];

const MONITORING_ENDPOINT = 'rest/monitor';
const QUERY_MONITORING_ENDPOINT = `${MONITORING_ENDPOINT}/repository`;

function MonitoringRestService($http) {
    return {
        monitorResources,
        monitorGC,
        monitorQuery,
        abortQueryByAlias,
        deleteQuery,
        getQueryCount,
        checkAutocompleteStatus
    };

    function monitorResources() {
        return $http.get(`${MONITORING_ENDPOINT}/infrastructure`);
    }

    function monitorGC() {
        return $http.post(`${MONITORING_ENDPOINT}/infrastructure/gc`);
    }

    function monitorQuery(repositoryID) {
        return $http.get(`${QUERY_MONITORING_ENDPOINT}/${repositoryID}/query/active`);
    }

    function abortQueryByAlias(alias, repositoryID) {
        return $http.delete(`${QUERY_MONITORING_ENDPOINT}/${repositoryID}/query?query=${encodeURIComponent(alias)}`);
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
