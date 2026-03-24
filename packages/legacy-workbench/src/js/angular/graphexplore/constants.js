/**
 * The event name for the graph operation event. This event is emitted when a user clicks on a node or edge in the graph.
 * @type {{EXTERNAL_CLICK_HANDLER: string}}
 */
export const VISGRAPH_OPERATION = {
    EXTERNAL_CLICK_HANDLER: 'externalClickHandler',
};

/**
 * The types of operations that can be performed on the graph. These are used to identify the type of operation that is
 * being performed when the VISGRAPH_OPERATION event is emitted.
 * @type {{NODE_CLICK: string, EDGE_CLICK: string}}
 */
export const VISGRAPH_OPERATION_TYPE = {
    NODE_CLICK: 'visgraph.click.node',
    EDGE_CLICK: 'visgraph.click.edge',
};

