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
        updateJdbcConfiguration,
        deleteJdbcConfiguration,
        getExistingSqlTablePreview,
        getNewSqlTablePreview
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

    function deleteJdbcConfiguration(name) {
        return $http.delete(`${JDBC_ENDPOINT}/${name}`);
    }

    function getExistingSqlTablePreview(name, limit) {
        // Limit in preview is optional. On backend default value is set to 100
        return $.ajax({
            method: 'GET',
            url: `/rest/sql-views/preview/${name}`,
            params: {
                limit
            }
        })
    }

    function getNewSqlTablePreview(sqlView, limit) {
        // Limit in preview is optional. On backend default value is set to 100
        return $.ajax({
            method: 'POST',
            url: "/rest/sql-views/preview",
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: sqlView,
            params: {
                limit
            },
            headers: {Accept: 'application/sparql-results+json'}
        })
    }
}
