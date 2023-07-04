/**
 * Holds all possible modes of a SPARQL query.
 * <ul>
 *     <li> UPDATE - are all queries that change statements in the repository.</li>
 *     <li> QUERY - are all queries that just search (not modified the repository)
 * @type {{QUERY: string, UPDATE: string}}
 */
export const QueryMode = {
    /**
     * UPDATE queries are INSERT, DELETE, LOAD, CLEAR, CREATE, DROP, COPY, MOVE, and ADD.
     */
    'UPDATE': 'update',

    /**
     * QUERY queries are SELECT, CONSTRUCT, ASK, DESCRIBE
     */
    'QUERY': 'query'
};
