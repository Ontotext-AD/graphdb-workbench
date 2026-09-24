import {Model} from '../common';
import {ViewRestrictionCondition} from './view-restriction-condition';

/**
 * Describes the conditions that restrict a given view.
 */
export class ViewRestriction extends Model<ViewRestriction> {
  readonly restrictions: ViewRestrictionCondition[];

  /**
   * Creates a new ViewRestriction instance.
   *
   * @param data - Partial data to initialize the ViewRestriction object.
   */
  constructor(data?: Partial<ViewRestriction>) {
    super();
    this.restrictions = data?.restrictions || [];
  }
}
