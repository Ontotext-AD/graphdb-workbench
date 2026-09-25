import {Data, Route} from '@angular/router';
import {
  RepositoryPermissionType,
  RepositoryType,
  ViewRestrictionCondition,
} from '@ontotext/workbench-api';

export interface WorkbenchRoute extends Route {
  data?: WorkbenchRouteData;
}

/**
 * Defines the metadata associated with a Workbench route.
 */
export interface WorkbenchRouteData extends Data {
  /**
   * The translation key for the page title.
   */
  title: string;

  /**
   * The translation key for the page-specific help information.
   */
  helpInfo?: string;

  /**
   * The URL of the page documentation.
   */
  documentationUrl?: string;

  /**
   * The repository types allowed for the route.
   * If undefined or empty, repositories of all types are allowed.
   */
  allowedRepositoryTypes?: RepositoryType[];

  /**
   * The repository permission required to access the route.
   * If undefined, no repository-specific permission is required.
   */
  requiredRepositoryPermission?: RepositoryPermissionType;

  /**
   * The restriction conditions that apply to this route. If undefined or empty, none apply.
   */
  viewRestrictions?: ViewRestrictionCondition[];
}
