export const DEFAULT_SPARQL_QUERY = 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n' +
    '\n' +
    '# Selects two variables to use as columns\n' +
    'SELECT ?id ?label {\n' +
    '    ?id rdfs:label ?label\n' +
    '    # The following placeholder must be present in the query\n' +
    '    #!filter\n' +
    '}';

export class JdbcConfigurationInfo {
    constructor(query = DEFAULT_SPARQL_QUERY, isNewJdbcConfiguration = true, jdbcConfigurationName = undefined) {
        this.query = query;
        this.jdbcConfigurationName = jdbcConfigurationName;
        this.isNewJdbcConfiguration = isNewJdbcConfiguration;
        this.isValidQuery = true;
        this.isValidQueryType = true;
        this.hasUndefinedColumns = false;
        this.isColumnsEmpty = false;
        this.columns = [];
    }
}
