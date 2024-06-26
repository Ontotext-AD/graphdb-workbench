/**
 * Defines all possible types of rdf resources that can be used for importing rdf data into GraphDB.
 *
 * @type {{DIRECTORY: string, TEXT: string, FILE: string, URL: string}}
 */
export const ImportResourceType = {
    /**
     * A server directory resource.
     */
    'DIRECTORY': 'directory',
    /**
     * A server file resource with rdf data.
     */
    'FILE': 'file',
    /**
     * A URL resource that returns rdf data.
     */
    'URL': 'url',
    /**
     * Text resource with rdf data.
     */
    'TEXT': 'text'
};
