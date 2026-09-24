/**
 * The restriction conditions that can apply to a view.
 */
export enum ViewRestrictionCondition {
  /**
   * The view is restricted when security is enabled and the user cannot write to the selected repository.
   */
  WRITE = 'write',

  /**
   * The view is restricted when the selected repository is an Ontop repository.
   */
  ONTOP = 'ontop',

  /**
   * The view is restricted when the selected repository is a FedX repository.
   */
  FEDX = 'fedx',

  /**
   * The view is restricted when the current license is invalid.
   */
  LICENSE = 'license'
}
