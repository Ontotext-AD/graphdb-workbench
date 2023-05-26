export const DEFAULT_SPARQL_QUERY = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
    'PREFIX ex: <http://example.com#>\n' +
    'DELETE {\n' +
    '  ?subject ex:myPredicate ?oldValue .\n' +
    '} INSERT {\n' +
    '  ?subject ex:myPredicate ?newValue .\n' +
    '} WHERE {\n' +
    '  ?id rdf:type ex:MyType .\n' +
    '  ?subject ex:isRelatedTo ?id .\n' +
    '}\n';

/**
 * Hold information about a SPARQL template.
 */
export class SparqlTemplateInfo {
    constructor(query, isNewTemplate = true, templateID = undefined) {
        this.query = query || DEFAULT_SPARQL_QUERY;
        this.templateID = templateID;
        this.isNewTemplate = isNewTemplate;
        this.templateExist = false;
        this.isValidTemplateId = true;
        this.isValidQuery = true;
        this.isValidQueryMode = true;
    }
}
