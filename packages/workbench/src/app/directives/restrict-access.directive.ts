import {Directive, inject, Input, OnChanges, OnDestroy, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthorizationService, Repository, RepositoryContextService, SecurityContextService, service} from '@ontotext/workbench-api';

export enum ViewPermissions {
  IS_ADMIN = 'isAdmin',
  IS_NOT_ADMIN = '!isAdmin',
  CAN_READ_ACTIVE_REPO = 'canReadActiveRepo',
  CAN_NOT_READ_ACTIVE_REPO = '!canReadActiveRepo',
  CAN_WRITE_ACTIVE_REPO = 'canWriteActiveRepo',
  CAN_NOT_WRITE_ACTIVE_REPO = '!canWriteActiveRepo',
  HAS_GRAPHQL_RIGHTS = 'hasGraphQLRights',
  HAS_NO_GRAPHQL_RIGHTS = '!hasGraphQLRights',
  IS_FEDEX_REPO = 'isFedexRepo',
  IS_NOT_FEDEX_REPO = '!isFedexRepo',
  IS_ONTOP_REPO = 'isOntopRepo',
  IS_NOT_ONTOP_REPO = '!isOntopRepo'
}

export type PermissionType = `${ViewPermissions}`;

/**
 * The `appRestrictAccess` directive conditionally includes or excludes elements in the DOM
 * based on the user's permissions. It evaluates a list of permissions and determines whether
 * the current user has access to the associated resource or functionality.
 *
 * ### Usage
 *
 * To use the directive, add it to an element and provide a list of permissions to check.
 * Permissions can be specified as strings or using the `Permission` enum.
 * You can also specify an alternative template to display when access is denied using the
 * `appRestrictAccessElse` input.
 *
 * ```html
 * <!-- Using string literals -->
 * <div *appRestrictAccess="['isAdmin', 'canReadActiveRepo']; else noAccessTemplate">
 *   This content is only visible to admins who can read the active repository.
 * </div>
 *
 * <!-- Using the Permission enum -->
 * <div *appRestrictAccess="[Permission.IS_ADMIN, Permission.CAN_READ_ACTIVE_REPO]; else noAccessTemplate">
 *   This content is only visible to admins who can read the active repository.
 * </div>
 *
 * <ng-template #noAccessTemplate>
 *   <p>You do not have access to view this content.</p>
 * </ng-template>
 * ```
 *
 * ### Permissions
 *
 * The following permissions are supported:
 * - `isAdmin` / `Permission.IS_ADMIN`: User must have admin privileges.
 * - `!isAdmin` / `Permission.IS_NOT_ADMIN`: User must not have admin privileges.
 * - `canReadActiveRepo` / `Permission.CAN_READ_ACTIVE_REPO`: User must have read access to the active repository.
 * - `!canReadActiveRepo` / `Permission.CAN_NOT_READ_ACTIVE_REPO`: User must not have read access to the active repository.
 * - `canWriteActiveRepo` / `Permission.CAN_WRITE_ACTIVE_REPO`: User must have write access to the active repository.
 * - `!canWriteActiveRepo` / `Permission.CAN_NOT_WRITE_ACTIVE_REPO`: User must not have write access to the active repository.
 * - `hasGraphQLRights` / `Permission.HAS_GRAPHQL_RIGHTS`: User must have GraphQL rights for the active repository.
 * - `!hasGraphQLRights` / `Permission.HAS_NO_GRAPHQL_RIGHTS`: User must not have GraphQL rights for the active repository.
 * - `isFedexRepo` / `Permission.IS_FEDEX_REPO`: The active repository must be a FedX repository.
 * - `!isFedexRepo` / `Permission.IS_NOT_FEDEX_REPO`: The active repository must not be a FedX repository.
 * - `isOntopRepo` / `Permission.IS_ONTOP_REPO`: The active repository must be an Ontop repository.
 * - `!isOntopRepo` / `Permission.IS_NOT_ONTOP_REPO`: The active repository must not be an Ontop repository.
 *
 * ### Notes
 *
 * - All specified permissions must be satisfied for the content to be displayed.
 * - If access is denied and no alternative template is provided, the content will not be rendered.
 */
@Directive({
  selector: '[appRestrictAccess]'
})
export class RestrictAccessDirective implements OnInit, OnChanges, OnDestroy {
  private readonly authorizationService = service(AuthorizationService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly templateRef = inject(TemplateRef);
  private readonly subscriptions: (() => void)[] = [];
  private readonly evaluationHandlersMap = new Map<ViewPermissions, (activeRepository?: Repository) => boolean>();

  @Input('appRestrictAccess') permissions: PermissionType[] = [];
  @Input() appRestrictAccessElse?: TemplateRef<unknown>;

  constructor() {
    this.registerEvaluationHandlers();
  }

  ngOnInit() {
    this.subscribeToContextChanges();
    this.updateView();
  }

  ngOnChanges() {
    this.updateView();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(unsub => unsub());
  }

  private registerEvaluationHandlers() {
    this.evaluationHandlersMap.set(ViewPermissions.IS_ADMIN, () => this.authorizationService.isAdmin());
    this.evaluationHandlersMap.set(ViewPermissions.CAN_READ_ACTIVE_REPO, (activeRepository) => activeRepository ? this.authorizationService.canReadRepo(activeRepository) : false);
    this.evaluationHandlersMap.set(ViewPermissions.CAN_WRITE_ACTIVE_REPO, (activeRepository) => activeRepository ? this.authorizationService.canWriteRepo(activeRepository) : false);
    this.evaluationHandlersMap.set(ViewPermissions.HAS_GRAPHQL_RIGHTS, (activeRepository) => activeRepository ? this.authorizationService.hasGqlRights(activeRepository) : false);
    this.evaluationHandlersMap.set(ViewPermissions.IS_FEDEX_REPO, (activeRepository) => activeRepository?.isFedx() ?? false);
    this.evaluationHandlersMap.set(ViewPermissions.IS_ONTOP_REPO, (activeRepository) => activeRepository?.isOntop() ?? false);
  }

  private subscribeToContextChanges() {
    const repositoryChangeSubscription = this.repositoryContextService.onSelectedRepositoryChanged(() => {
      this.updateView();
    });
    const userChangedSubscription = this.securityContextService.onAuthenticatedUserChanged(() => {
      this.updateView();
    });
    this.subscriptions.push(repositoryChangeSubscription, userChangedSubscription);
  }

  private updateView() {
    const hasAccess = this.checkAccess();

    this.viewContainer.clear();
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.appRestrictAccessElse) {
      this.viewContainer.createEmbeddedView(this.appRestrictAccessElse);
    }
  }

  private checkAccess(): boolean {
    const activeRepository = this.repositoryContextService.getSelectedRepository();
    return this.permissions.every((permission) => this.evaluatePermission(permission, activeRepository));
  }

  private evaluatePermission(perm: PermissionType, activeRepository?: Repository): boolean {
    const isNegated = perm.startsWith('!');
    const basePerm = (isNegated ? perm.slice(1) : perm) as ViewPermissions;

    const handler = this.evaluationHandlersMap.get(basePerm);
    if (handler) {
      const result = handler(activeRepository);
      return isNegated ? !result : result;
    } else {
      throw new Error(`${basePerm} permission is not supported`);
    }
  }
}
