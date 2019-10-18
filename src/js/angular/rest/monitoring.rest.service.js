angular
    .module('graphdb.framework.rest.monitoring.service', [])
    .factory('MonitoringRestService', MonitoringRestService);

MonitoringRestService.$inject = ['$http'];

const MONITORING_ENDPOINT = 'rest/monitor';
const QUERY_MONITORING_ENDPOINT = `${MONITORING_ENDPOINT}/query`;

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
        return $http.get(`${MONITORING_ENDPOINT}/resource`);
    }

    function monitorGC() {
        return $http.post(`${MONITORING_ENDPOINT}/resource/gc`);
    }

    function monitorQuery() {
        return $http.get(QUERY_MONITORING_ENDPOINT);
    }

    function abortQueryByAlias(alias) {
        return $http.delete(`${QUERY_MONITORING_ENDPOINT}?queryAlias=${encodeURIComponent(alias)}`);
    }

    function deleteQuery(queryId) {
        return $http.delete(`${QUERY_MONITORING_ENDPOINT}?queryId=${encodeURIComponent(queryId)}`);
    }

    function getQueryCount() {
        return $http({
            url: `${QUERY_MONITORING_ENDPOINT}/count`,
            method: 'GET',
            timeout: 10000
        });
    }

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }
}
