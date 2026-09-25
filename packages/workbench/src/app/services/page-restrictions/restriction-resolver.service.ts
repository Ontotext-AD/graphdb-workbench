import {Injectable} from '@angular/core';
import {
  AuthorizationService,
  LicenseContextService,
  Repository,
  RepositoryPermissionType,
  RepositoryType,
  SecurityContextService,
  service,
  ViewRestrictionCondition,
} from '@ontotext/workbench-api';
import {RestrictionReason} from './restriction-reason';
import {RestrictionContext} from './model/restriction-context';

@Injectable({ providedIn: 'root' })
export class RestrictionResolverService {
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);

  resolve(ctx: RestrictionContext): RestrictionReason[] {
    const isLicenseValid = this.licenseContextService.getLicenseSnapshot()?.valid ?? false;
    const isSecurityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;
    const canCreateRepository = this.authorizationService.isRepoManager();
    const requiresWriteAccess = ctx.viewRestriction?.requiresWriteAccess() ?? false;
    // Only the conditions declared by the page produce restriction reasons, e.g. an invalid license doesn't
    // restrict a page that doesn't declare the license condition.
    const isLicenseRestricted = this.isRestrictedBy(ctx, ViewRestrictionCondition.LICENSE) && !isLicenseValid;

    const accessibleRepositoriesCount = this.authorizationService.getAccessibleRepositories(true, requiresWriteAccess)
      .filterByType(ctx.allowedRepositoryTypes)
      .filter((repository) => !ctx.requiredRepositoryPermission ||
        this.authorizationService.hasRepoPermission(ctx.requiredRepositoryPermission, repository)).length;
    const hasAccessibleRepositories = accessibleRepositoriesCount > 0;

    // A repository selected outside this page's filters (e.g. wrong type, or missing the
    // permission this route requires) is not usable here even though it's the active selection,
    // so treat the page as if no repository were selected.
    const repo = this.isSelectedRepositoryAllowed(ctx) ? ctx.selectedRepository : undefined;
    const canWrite = this.authorizationService.canWriteRepo(repo);

    const reasons: RestrictionReason[] = [];

    if (!repo && !isLicenseRestricted) {
      if (canCreateRepository && !hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_accessible_repos_create_one',
        });
      } else if (canCreateRepository && hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_active_repository_select_or_create_one',
        });
      } else if (!canCreateRepository && hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_active_repository_select_one',
        });
      } else {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_accessible_repositories',
        });
      }
    }

    if (repo) {
      const isWriteRestricted = this.isRestrictedBy(ctx, ViewRestrictionCondition.WRITE) && isSecurityEnabled && !canWrite;
      if (isWriteRestricted) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.no_write_permission',
          translationParams: { repositoryId: repo.id },
        });
      }

      if (!isWriteRestricted && this.isRestrictedBy(ctx, ViewRestrictionCondition.ONTOP) && repo.isOntop()) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.read_only_ontop',
          translationParams: {repositoryId: repo.id},
        });
      }

      if (!isWriteRestricted && this.isRestrictedBy(ctx, ViewRestrictionCondition.FEDX) && repo.isFedx()) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.fedx_unsupported',
          translationParams: {pageTitle: ctx.pageTitle},
        });
      }
    }

    if (isLicenseRestricted) {
      reasons.push({
        severity: 'warn',
        translationKey: 'components.page_restrictions.invalid_license',
        actionLabelKey: 'components.page_restrictions.set_new_license',
        actionLink: '/license',
      });
    }

    if (!hasAccessibleRepositories) {
      if (requiresWriteAccess) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_accessible_writable_repos',
        });
      }
    }

    return reasons;
  }

  /**
   * Checks whether the page declares the given restriction condition.
   *
   * @param ctx The restriction context, carrying the page's declared view restriction.
   * @param condition The restriction condition to look for.
   * @returns `true` if the page declares the condition.
   */
  private isRestrictedBy(ctx: RestrictionContext, condition: ViewRestrictionCondition): boolean {
    return ctx.viewRestriction?.isRestrictedBy(condition) ?? false;
  }

  /**
   * Determines whether the currently selected repository is allowed by this route's filters
   * (repository type and required permission). A repository can be selected globally while not
   * being one of the repositories this specific page would offer in its picker; in that case it
   * must not be treated as a valid selection here.
   *
   * @param ctx The restriction context, carrying the selected repository and the route's filters.
   * @returns `true` if there is a selected repository and it passes both filters.
   */
  private isSelectedRepositoryAllowed(ctx: RestrictionContext): boolean {
    const repo = ctx.selectedRepository;
    if (!repo) {
      return false;
    }

    return this.matchesAllowedType(repo, ctx.allowedRepositoryTypes) &&
      this.matchesRequiredPermission(repo, ctx.requiredRepositoryPermission);
  }

  /**
   * Checks the repository's type against the route's allowed types.
   *
   * @param repo The repository to check.
   * @param allowedRepositoryTypes The repository types this route allows. An empty or missing list means no restriction.
   * @returns `true` if no type restriction applies, or the repository's type is one of the allowed ones.
   */
  private matchesAllowedType(repo: Repository, allowedRepositoryTypes?: RepositoryType[]): boolean {
    if (!allowedRepositoryTypes?.length) {
      return true;
    }

    return !!repo.type && allowedRepositoryTypes.includes(repo.type);
  }

  /**
   * Checks whether the user has the permission this route requires on the repository.
   *
   * @param repo The repository to check.
   * @param requiredRepositoryPermission The permission this route requires. `undefined` means no restriction.
   * @returns `true` if no permission restriction applies, or the user has the required permission.
   */
  private matchesRequiredPermission(repo: Repository, requiredRepositoryPermission?: RepositoryPermissionType): boolean {
    if (!requiredRepositoryPermission) {
      return true;
    }

    return this.authorizationService.hasRepoPermission(requiredRepositoryPermission, repo);
  }
}
