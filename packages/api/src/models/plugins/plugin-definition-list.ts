import {ModelList} from '../common';
import {PluginDefinition} from './plugin-definition';

export class PluginDefinitionList extends ModelList<PluginDefinition> {

  constructor(data?: PluginDefinition[]) {
    super(data);
  }
}
