/**
 * The restriction conditions that can apply to a view.
 */
export enum ViewRestrictionCondition {
  /**
   * The view is restricted when security is enabled and the user cannot write to the selected repository.
   */
  MISSING_WRITE_PERMISSIONS = 'MISSING_WRITE_PERMISSIONS',

  /**
   * The view is restricted when the selected repository is an Ontop repository.
   */
  IS_ONTOP = 'IS_ONTOP',

  /**
   * The view is restricted when the selected repository is a FedX repository.
   */
  IS_FEDEX = 'IS_FEDEX',

  /**
   * The view is restricted when the current license is invalid.
   */
  IS_LICENSE_INVALID = 'IS_LICENSE_INVALID',

  /**
   * The view is restricted when no repository is selected.
   */
  IS_REPOSITORY_NOT_SELECTED = 'IS_REPOSITORY_NOT_SELECTED'
}
