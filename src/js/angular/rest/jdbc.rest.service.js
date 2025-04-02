angular
    .module('graphdb.framework.rest.jdbc.service', [])
    .factory('JdbcRestService', JdbcRestService);

JdbcRestService.$inject = ['$http', '$repositories', '$translate'];

const JDBC_ENDPOINT = 'rest/sql-views';

function JdbcRestService($http, $translate) {

    return {
        getJdbcConfigurations,
        getJdbcConfiguration,
        createNewJdbcConfiguration,
        updateJdbcConfiguration,
        deleteJdbcConfiguration,
        getColumnNames,
        getColumnsTypeSuggestion,
        getExistingSqlTablePreview,
        getNewSqlTablePreview
    };

    function getJdbcConfigurations() {
        return $http.get(`${JDBC_ENDPOINT}/tables`);
    }

    function getJdbcConfiguration(configuration) {
        return $http.get(`${JDBC_ENDPOINT}/tables/${configuration}`);
    }

    function createConfiguration(method, table, configuration) {
        const url = table ? `${JDBC_ENDPOINT}/tables/${table}` : `${JDBC_ENDPOINT}/tables`;
        return $http({
                method,
                url: url,
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
            throw new Error($translate.instant('jdbc.column.names.constraint'));
        }

        return $http({
                method: 'POST',
                url: `${JDBC_ENDPOINT}/types`,
                data: {
                    query: query,
                    column_names: columns
                }
            }
        );
    }
    function getExistingSqlTablePreview(name, limit) {
        // Limit in preview is optional. On backend default value is set to 100
        return $http({
            method: 'GET',
            url: `rest/sql-views/preview/${name}`,
            params: {
                limit
            }
        });
    }

    function getNewSqlTablePreview(sqlView, limit) {
        // Limit in preview is optional. On backend default value is set to 100
        return $http({
            method: 'POST',
            url: "rest/sql-views/preview",
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: sqlView,
            params: {
                limit
            },
            headers: {Accept: 'application/sparql-results+json'}
        });
    }
}
