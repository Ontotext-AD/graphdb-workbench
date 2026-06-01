import {
  Repository,
  RepositoryPermissionType,
  RepositoryType,
} from '@ontotext/workbench-api';

export interface RestrictionContext {
  selectedRepository?: Repository;
  isRestricted: boolean;
  pageTitle: string;
  actionLabelKey?: string;
  actionLink?: string;
  isExternalAction?: boolean;
  allowedRepositoryTypes?: RepositoryType[];
  requiredRepositoryPermission?: RepositoryPermissionType;
}
