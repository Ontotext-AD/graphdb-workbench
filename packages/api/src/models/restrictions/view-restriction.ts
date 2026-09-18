import {Model} from '../common';

/**
 * The restriction conditions that can apply to a view.
 */
export type ViewRestrictionCondition = 'write' | 'ontop' | 'fedx' | 'license';

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
