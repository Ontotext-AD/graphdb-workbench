angular
    .module('graphdb.framework.rest.jdbc.service', [])
    .factory('JdbcRestService', JdbcRestService);

JdbcRestService.$inject = ['$http', '$repositories'];

const JDBC_ENDPOINT = 'rest/sql-views';

function JdbcRestService($http) {

    return {
        getJdbcConfigurations,
        getJdbcConfiguration,
        createNewJdbcConfiguration,
        updateJdbcConfiguration,
        deleteJdbcConfiguration,
        getColumnNames,
        getColumnsTypeSuggestion
    };

    function getJdbcConfigurations() {
        return $http.get(`${JDBC_ENDPOINT}/tables`);
    }

    function getJdbcConfiguration(configuration) {
        return $http.get(`${JDBC_ENDPOINT}/tables/${configuration}`);
    }

    function createConfiguration(method, table, configuration) {
        return $http({
                method,
                url: `/${JDBC_ENDPOINT}/tables/${table}`,
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

    function deleteJdbcConfiguration(name) {
        return $http.delete(`${JDBC_ENDPOINT}/tables/${name}`);
    }

    function getColumnNames(query) {
        const headers = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            }
        };

        return $http.post(`${JDBC_ENDPOINT}/columns`, query, headers);
    }

    function getColumnsTypeSuggestion(query, columns) {
        if (!Array.isArray(columns)) {
            throw 'Column names must be placed in array.'
        }

        return $http({
                method: 'POST',
                url: `/${JDBC_ENDPOINT}/types`,
                data: {
                    query: query,
                    column_names: columns
                }
            }
        );
    }
}
