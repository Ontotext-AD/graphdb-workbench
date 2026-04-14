import {GraphExploreEvent, GraphConfigList} from '@ontotext/shared-components';

export type ExploreVisualGraphElement =
  HTMLOntoGraphExploreSplitButtonElement & {
  _exploreVisualGraphHandler?: (event: CustomEvent<GraphExploreEvent>) => void;
  fetchGraphConfigs: () => Promise<GraphConfigList>
};
