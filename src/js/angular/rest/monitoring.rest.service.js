angular
    .module('graphdb.framework.rest.monitoring.service', [])
    .factory('MonitoringRestService', MonitoringRestService);

MonitoringRestService.$inject = ['$http'];

function MonitoringRestService($http) {
    return {
        checkAutocompleteStatus
    };

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }
}
