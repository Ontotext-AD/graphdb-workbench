/**
 * Represents progress status of an import rdf resource.
 *
 * @type {{DONE: string, INTERRUPTING: string, IMPORTING: string, ERROR: string, PENDING: string, NONE: string}}
 */
export const ImportResourceStatus = {
    /**
     * Initial state. The rdf resources in this state are available in the server, but its data is not inserted into GraphDB.
     */
    'NONE': 'NONE',
    'UPLOADING': 'UPLOADING',
    'UPLOAD_ERROR': 'UPLOAD_ERROR',
    /**
     * Marks resource as uploaded.
     */
    'UPLOADED': 'UPLOADED',
    /**
     * The import of rdf resources in this state was not started because GraphDB was stopped.
     */
    'PENDING': 'PENDING',
    /**
     * The rdf resource inserting is in progress .
     */
    'IMPORTING': 'IMPORTING',
    /**
     * The rdf resource is inserted into GraphDB.
     */
    'DONE': 'DONE',
    /**
     * Marks rdf resources as not inserted into GraphDB for some reason.
     */
    'ERROR': 'ERROR',
    /**
     * The rdf resources in this status are interrupted or are marked for interruption.
     */
    'INTERRUPTING': 'INTERRUPTING'
};
