angular
    .module('graphdb.framework.rest.jdbc.service', [])
    .factory('JdbcRestService', JdbcRestService);

JdbcRestService.$inject = ['$http', '$repositories'];

const JDBC_ENDPOINT = 'rest/sql-views';

function JdbcRestService($http) {

    return {
        getJdbcConfigurations
    };

    function getJdbcConfigurations() {
        return $http.get(`${JDBC_ENDPOINT}/tables`);
    }
}
