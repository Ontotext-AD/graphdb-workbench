import {NodeAction, ToolbarDock, UiConfig} from 'graphwise-reactodia';

/**
 * The Workbench UI configuration for graphwise-reactodia
 */
export const GRAPHWISE_REACTODIA_UI_CONFIG: UiConfig = {
  actionsToolbar: {dock: ToolbarDock.NE},
  nodeActions: [
    NodeAction.GROUP,
    NodeAction.REMOVE,
    NodeAction.EXPAND,
    NodeAction.CONNECTIONS,
    NodeAction.ADD_TO_FILTER,
    NodeAction.ANNOTATE,
    NodeAction.ESTABLISH_LINK
  ]
};
