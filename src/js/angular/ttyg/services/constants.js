/**
 * The length of the message to be cut and displayed to the user from the error
 * server's response.
 * @type {number}
 */
export const TTYG_ERROR_MSG_LENGTH = 100;

/**
 * The key to use when filtering agents indicating that all agents should be shown.
 * @type {string}
 */
export const AGENTS_FILTER_ALL_KEY = 'ALL';

/**
 * An enum with possible agent operations. This is used in the agent settings modal.
 */
export const AGENT_OPERATION = {
    CREATE: 'create',
    EDIT: 'edit',
    CLONE: 'clone'
};
