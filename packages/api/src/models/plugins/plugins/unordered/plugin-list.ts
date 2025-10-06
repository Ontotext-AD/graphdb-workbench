import {ModelList} from '../../../common';
import {Plugin} from '../plugin';

/**
 * PluginList is a class that extends ModelList to manage a list of PluginList objects.
 */
export class PluginList<T extends Plugin> extends ModelList<T> {
  constructor() {
    super();
  }
}
