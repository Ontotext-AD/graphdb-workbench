import {GraphConfig} from '@ontotext/workbench-api';

/**
 * Actions triggered from the Graph Explore split button UI.
 */
export enum GraphExploreAction {
  DEFAULT = 'default',
  SELECT = 'select',
  CREATE = 'create',
}

/**
 * Event payload emitted when a user interacts with the Graph Explore split button.
 *
 * The `action` field describes the interaction source:
 * - `default`: triggered when the main button is clicked
 * - `select`: triggered when a dropdown menu item is selected
 * - `create`: triggered when the user clicks the link to create a graph.
 */
export type GraphExploreEvent = {
  action: GraphExploreAction;
  graphConfig?: GraphConfig
}
