import {ModelList} from '../common';
import {GraphConfig} from './graph-config';
import {StartMode} from './start-mode';

/**
 * Represents a collection of graph configurations.
 */
export class GraphConfigList extends ModelList<GraphConfig> {
  constructor(graphConfigs?: GraphConfig[]) {
    super(graphConfigs);
  }

  /**
   * Returns all graph configurations that match the provided start mode.
   *
   * @param {StartMode} startMode - The start mode used to filter graph configurations.
   * @returns {GraphConfig[]} An array of graph configurations whose `startMode` matches the given value.
   */
  getByStartMode(startMode: StartMode): GraphConfig[] {
    return this.items.filter(config => config.startMode === startMode);
  }
}
