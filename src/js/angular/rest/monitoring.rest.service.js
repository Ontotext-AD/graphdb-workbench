angular
    .module('graphdb.framework.rest.monitoring.service', [])
    .factory('MonitoringRestService', MonitoringRestService);

MonitoringRestService.$inject = ['$http'];

function MonitoringRestService($http) {
    return {
        monitorResources,
        monitorGC,
        monitorQuery,
        deleteQuery,
        getQueryCount,
        checkAutocompleteStatus
    };

    function monitorResources() {
        return $http.get('rest/monitor/resource');
    }

    function monitorGC() {
        return $http.post('rest/monitor/resource/gc');
    }

    function monitorQuery() {
        return $http.get('rest/monitor/query');
    }

    function deleteQuery(queryId) {
        return $http.delete(`rest/monitor/query?queryId=${encodeURIComponent(queryId)}`);
    }

    function getQueryCount() {
        return $http({
            url: 'rest/monitor/query/count',
            method: 'GET',
            timeout: 10000
        });
    }

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }
}
