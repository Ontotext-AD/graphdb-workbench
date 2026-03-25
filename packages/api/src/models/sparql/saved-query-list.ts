import {ModelList} from '../common';
import {SavedQuery} from './saved-query';

export class SavedQueryList extends ModelList<SavedQuery> {
  constructor(items: SavedQuery[] = []) {
    super(items);
  }

  getFirstQuery(): SavedQuery | undefined {
    return this.getFirstItem();
  }
}
