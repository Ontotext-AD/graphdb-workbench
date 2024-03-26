/**
 * Represents progress status of an import resource.
 *
 * @type {{DONE: string, INTERRUPTING: string, IMPORTING: string, ERROR: string, PENDING: string, NONE: string}}
 */
export const ImportResourceStatus = {
    /**
     * Initial state. The resources in this state are available in the server, but its data is not inserted into GraphDB.
     */
    'NONE': 'NONE',
    /**
     * The import of resources in this state was not started because GraphDB was stopped.
     */
    'PENDING': 'PENDING',
    /**
     * The resource inserting is in progress .
     */
    'IMPORTING': 'IMPORTING',
    /**
     * The resource is inserted into GraphDB.
     */
    'DONE': 'DONE',
    /**
     * Marks resource as not inserted into GraphDB for some reason.
     */
    'ERROR': 'ERROR',
    /**
     * The resources in this status are interrupted or are marked for interruption.
     */
    'INTERRUPTING': 'INTERRUPTING'
};
