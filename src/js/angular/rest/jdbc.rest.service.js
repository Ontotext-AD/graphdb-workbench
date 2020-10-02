angular
    .module('graphdb.framework.rest.jdbc.service', [])
    .factory('JdbcRestService', JdbcRestService);

JdbcRestService.$inject = ['$http', '$repositories'];

const JDBC_ENDPOINT = 'rest/sql-views/tables';

function JdbcRestService($http) {

    return {
        getJdbcConfigurations,
        getJdbcConfiguration,
        createNewJdbcConfiguration,
        updateJdbcConfiguration
    };

    function getJdbcConfigurations() {
        return $http.get(`${JDBC_ENDPOINT}`);
    }

    function getJdbcConfiguration(configuration) {
        return $http.get(`${JDBC_ENDPOINT}/${configuration}`);
    }

    function createConfiguration(method, table, configuration) {
        return $http({
                method,
                url: `/${JDBC_ENDPOINT}/${table}`,
                noCancelOnRouteChange: true,
                data: {
                    name: configuration.name,
                    query: configuration.query,
                    columns: configuration.columns || []
                }
            }
        );
    }

    function createNewJdbcConfiguration(configuration) {
        return createConfiguration('POST', '', configuration);
    }

    function updateJdbcConfiguration(configuration) {
        return createConfiguration('PUT', configuration.name, configuration);
    }

}
