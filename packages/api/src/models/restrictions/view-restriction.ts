import {Model} from '../common';
import {ViewRestrictionCondition} from './view-restriction-condition';
import {RepositoryPermissionType, RepositoryType} from '../repositories';

/**
 * Describes the conditions that restrict a given view.
 */
export class ViewRestriction extends Model<ViewRestriction> {
  readonly restrictions: ViewRestrictionCondition[];

  /**
   * The repository types the view works with. If empty, repositories of all types are allowed.
   */
  readonly allowedRepositoryTypes: RepositoryType[];

  /**
   * The repository permission the view requires. If undefined, no repository-specific permission is required.
   */
  readonly requiredRepositoryPermission?: RepositoryPermissionType;

  constructor(restrictions: ViewRestrictionCondition[] = [], allowedRepositoryTypes: RepositoryType[] = [], requiredRepositoryPermission?: RepositoryPermissionType) {
    super();
    this.restrictions = restrictions;
    this.allowedRepositoryTypes = allowedRepositoryTypes;
    this.requiredRepositoryPermission = requiredRepositoryPermission;
  }

  /**
   * Checks whether the view requires write access to the selected repository.
   *
   * This is independent of whether the view is currently restricted: a view can be restricted for other reasons
   * (e.g. invalid license, Ontop or FedX repository) without requiring write access.
   *
   * @returns `true` when the view declares the {@link ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS} condition; otherwise, `false`.
   */
  requiresWriteAccess(): boolean {
    return this.isRestrictedBy(ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS);
  }

  /**
   * Checks whether the view requires a selected repository.
   *
   * @returns `true` when the view declares the {@link ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED} condition;
   * otherwise, `false`.
   */
  requiresSelectedRepository(): boolean {
    return this.isRestrictedBy(ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED);
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
