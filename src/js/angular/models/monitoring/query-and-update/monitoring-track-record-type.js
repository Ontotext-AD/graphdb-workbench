export const MonitoringTrackRecordType = {
    /**
     * Evaluating a SPARQL query (e.g., SELECT statements, or checking if statements exist)
     */
    'QUERY': 'QUERY',

    /**
     * Executing a SPARQL update (e.g., adding or removing statements)
     */
    'UPDATE': 'UPDATE',

    /**
     * Executing a SPARQL query in a GraphQL context
     */
    'GRAPHQL': 'GRAPHQL',

    'ANY': 'ANY'
};
