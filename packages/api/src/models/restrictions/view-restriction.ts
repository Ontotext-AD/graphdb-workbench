import {Model} from '../common';
import {ViewRestrictionCondition} from './view-restriction-condition';

/**
 * Describes the conditions that restrict a given view.
 */
export class ViewRestriction extends Model<ViewRestriction> {
  readonly restrictions: ViewRestrictionCondition[];

  constructor(data?: Partial<ViewRestriction>) {
    super();
    this.restrictions = data?.restrictions || [];
  }

  /**
   * Checks whether the view requires write access to the selected repository.
   *
   * This is independent of whether the view is currently restricted: a view can be restricted for other reasons
   * (e.g. invalid license, Ontop or FedX repository) without requiring write access.
   *
   * @returns `true` when the view declares the {@link ViewRestrictionCondition.WRITE} condition; otherwise, `false`.
   */
  requiresWriteAccess(): boolean {
    return this.isRestrictedBy(ViewRestrictionCondition.WRITE);
  }

  /**
   * Checks whether the view declares the given restriction condition.
   *
   * @param condition The restriction condition to look for.
   * @returns `true` when the condition is one of the view's restrictions; otherwise, `false`.
   */
  isRestrictedBy(condition: ViewRestrictionCondition): boolean {
    return this.restrictions.includes(condition);
  }
}
