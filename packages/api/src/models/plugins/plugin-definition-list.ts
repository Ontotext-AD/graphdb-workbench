import {ModelList} from '../common';
import {PluginDefinition} from './plugin-definition';

/**
 * PluginDefinitionList is a class that extends ModelList to manage a list of PluginDefinition objects.
 */
export class PluginDefinitionList extends ModelList<PluginDefinition> {

  constructor(data?: PluginDefinition[]) {
    super(data);
  }
}
