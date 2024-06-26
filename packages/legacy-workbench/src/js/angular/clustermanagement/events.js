export const UPDATE_CLUSTER = 'updateCluster';
export const DELETE_CLUSTER = 'deleteCluster';

/**
 * Event fired from the cluster-graphical-view component up to its parent when user clicks somewhere in the view.
 * The payload is the event target HTMLElement.
 * @type {string}
 */
export const CLICK_IN_VIEW = 'clickInView';

/**
 * Event fired from the cluster-graphical-view component up to its parent when user selects a node from the visualization.
 * The payload is the selected node.
 * @type {string}
 */
export const NODE_SELECTED = 'nodeSelected';

/**
 * Event fired when the cluster zone visualization is clicked while there is no cluster yet.
 * @type {string}
 */
export const CREATE_CLUSTER = 'createCluster';

/**
 * Event fired from the cluster management view component down to the child visualization informing it that the model
 * was updated.
 * @type {string}
 */
export const MODEL_UPDATED = 'modelUpdated';
