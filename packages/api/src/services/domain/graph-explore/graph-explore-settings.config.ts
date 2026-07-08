import {GraphExploreSettings} from '../../../models/graph-explore/graph-explore-settings';

/**
 * Fallback graph settings used when the caller doesn't provide a value. In visual graph these
 * come from the graph-config settings, which are not present for reactodia, so we mirror the
 * legacy default settings here.
 */
export const DEFAULT_GRAPH_EXPLORE_SETTINGS: GraphExploreSettings = {
  includeInferred: true,
  sameAs: true,
  languages: ['en'],
  linksLimit: 100,
};
