import {GraphExploreEvent, GraphConfig} from '@ontotext/shared-components';

export type ExploreVisualGraphElement =
  HTMLOntoGraphExploreSplitButtonElement & {
  _exploreVisualGraphHandler?: (event: CustomEvent<GraphExploreEvent>) => void;
  fetchGraphConfigs: () => Promise<GraphConfig[]>;
};
