import {Repository, RepositoryPermissionType, RepositorySizeInfo} from '@ontotext/workbench-api';

/**
 * What the repository information popover shows.
 */
export interface RepositoryInfo {
  /**
   * The repository the popover is opened for.
   */
  repository: Repository;

  /**
   * The permission of the current user for the repository.
   */
  permission: RepositoryPermissionType;

  /**
   * Whether the statement counts are being loaded.
   */
  loading: boolean;

  /**
   * The statement counts. Undefined when the repository is not running, or the request is running or has failed.
   */
  sizeInfo?: RepositorySizeInfo;
}
