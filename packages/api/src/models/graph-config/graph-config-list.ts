import {ModelList} from '../common';
import {GraphConfig} from './graph-config';

/**
 * Represents a collection of graph configurations.
 */
export class GraphConfigList extends ModelList<GraphConfig> {
  constructor(graphConfigs?: GraphConfig[]) {
    super(graphConfigs);
  }
}
