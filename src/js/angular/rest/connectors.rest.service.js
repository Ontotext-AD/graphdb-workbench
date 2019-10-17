angular
    .module('graphdb.framework.rest.connectors.service', [])
    .factory('ConnectorsRestService', ConnectorsRestService);

ConnectorsRestService.$inject = ['$http'];

const CONNECTORS_ENDPOINT = 'rest/connectors';

function ConnectorsRestService($http) {

    return {
        getConnectors,
        initConnector,
        hasConnector,
        checkConnector
    };

    function getConnectors() {
        return $http.get(CONNECTORS_ENDPOINT);
    }

    function initConnector(prefix) {
        return $http.get(`${CONNECTORS_ENDPOINT}/options?prefix=${prefix}`);
    }

    function hasConnector(prefix) {
        return $http.get(`${CONNECTORS_ENDPOINT}/existing?prefix=${prefix}`);
    }

    function checkConnector(data) {
        return $http.post(`${CONNECTORS_ENDPOINT}/check`, data, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
}
