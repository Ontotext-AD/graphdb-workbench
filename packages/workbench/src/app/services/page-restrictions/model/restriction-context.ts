import {
  Repository,
  RepositoryPermissionType,
  RepositoryType,
  ViewRestriction,
} from '@ontotext/workbench-api';

export interface RestrictionContext {
  selectedRepository?: Repository;
  /**
   * The restriction conditions declared by the page. Only declared conditions produce restriction reasons.
   * If undefined, no conditions are declared.
   */
  viewRestriction?: ViewRestriction;
  pageTitle: string;
  actionLabelKey?: string;
  actionLink?: string;
  isExternalAction?: boolean;
  allowedRepositoryTypes?: RepositoryType[];
  requiredRepositoryPermission?: RepositoryPermissionType;
}
