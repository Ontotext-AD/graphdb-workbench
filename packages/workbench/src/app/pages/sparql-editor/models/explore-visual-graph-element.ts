import {GraphExploreEvent} from '@ontotext/shared-components';
import {GraphConfig} from '@ontotext/workbench-api';

export type ExploreVisualGraphElement =
  HTMLOntoGraphExploreSplitButtonElement & {
  _exploreVisualGraphHandler?: (event: CustomEvent<GraphExploreEvent>) => void;
  fetchGraphConfigs: () => Promise<GraphConfig[]>;
};
