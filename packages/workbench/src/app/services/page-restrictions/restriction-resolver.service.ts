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

const TRANSLATION_PREFIX = 'components.page_restrictions';

@Injectable({providedIn: 'root'})
export class RestrictionResolverService {
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);

  resolve(ctx: RestrictionContext): RestrictionReason[] {
    const repo = this.getSelectedRepository(ctx);
    const isLicenseRestricted = this.isLicenseRestricted(ctx);
    const hasAccessibleRepositories = this.hasAccessibleRepositories(ctx);
    const reasons: RestrictionReason[] = [];

    if (repo) {
      reasons.push(...this.getSelectedRepositoryReasons(ctx, repo));
    } else if (!isLicenseRestricted) {
      reasons.push(this.getNoSelectedRepositoryReason(hasAccessibleRepositories));
    }

    if (isLicenseRestricted) {
      reasons.push({
        ...this.warn('invalid_license'),
        actionLabelKey: `${TRANSLATION_PREFIX}.set_new_license`,
        actionLink: '/license',
      });
    }

    if (!hasAccessibleRepositories && this.requiresWriteAccess(ctx)) {
      reasons.push(this.info('no_accessible_writable_repos'));
    }

    return reasons;
  }

  /**
   * Returns the selected repository if it is allowed by this page's filters.
   *
   * A repository can be selected globally while not being one of the repositories
   * this page would offer in its picker. In that case, it is not considered usable.
   */
  private getSelectedRepository(ctx: RestrictionContext): Repository | undefined {
    const repo = ctx.selectedRepository;
    return repo && this.isRepositoryAllowed(ctx, repo) ? repo : undefined;
  }

  /**
   * Resolves the message shown when no repository is selected, based on whether
   * the user can pick an existing repository and whether they can create one.
   */
  private getNoSelectedRepositoryReason(hasAccessibleRepositories: boolean): RestrictionReason {
    const canCreateRepository = this.authorizationService.isRepoManager();

    if (hasAccessibleRepositories) {
      return this.info(canCreateRepository ? 'no_active_repository_select_or_create_one' : 'no_active_repository_select_one');
    }

    return this.info(canCreateRepository ? 'no_accessible_repos_create_one' : 'no_accessible_repositories');
  }

  /**
   * Resolves the restrictions that apply to the selected repository.
   * A missing write permission takes precedence over the Ontop and FedX restrictions.
   */
  private getSelectedRepositoryReasons(ctx: RestrictionContext, repo: Repository): RestrictionReason[] {
    if (this.isWriteRestricted(ctx, repo)) {
      return [
        this.warn('no_write_permission', {
          repositoryId: repo.id,
        }),
      ];
    }

    if (this.isRestrictedBy(ctx, ViewRestrictionCondition.ONTOP) && repo.isOntop()) {
      return [
        this.warn('read_only_ontop', {
          repositoryId: repo.id,
        }),
      ];
    }

    if (this.isRestrictedBy(ctx, ViewRestrictionCondition.FEDX) && repo.isFedx()) {
      return [
        this.warn('fedx_unsupported', {
          pageTitle: ctx.pageTitle,
        }),
      ];
    }

    return [];
  }

  /**
   * Checks whether the selected repository is restricted because the page requires
   * write access, security is enabled, and the user cannot write to the repository.
   */
  private isWriteRestricted(ctx: RestrictionContext, repo: Repository): boolean {
    const isSecurityEnabled =
      this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;

    return this.requiresWriteAccess(ctx) && isSecurityEnabled && !this.authorizationService.canWriteRepo(repo);
  }

  /**
   * Checks whether the page declares the license condition and the license is invalid.
   */
  private isLicenseRestricted(ctx: RestrictionContext): boolean {
    const isLicenseValid =
      this.licenseContextService.getLicenseSnapshot()?.valid ?? false;

    return this.isRestrictedBy(ctx, ViewRestrictionCondition.LICENSE) && !isLicenseValid;
  }

  /**
   * Checks whether there is at least one repository the user can pick on this page.
   *
   * The repository must be accessible, writable when required, and satisfy the
   * page's repository type and permission filters.
   */
  private hasAccessibleRepositories(ctx: RestrictionContext): boolean {
    return this.authorizationService
      .getAccessibleRepositories(true, this.requiresWriteAccess(ctx))
      .filterByType(ctx.allowedRepositoryTypes)
      .filter((repository) =>
        this.matchesRequiredPermission(
          repository,
          ctx.requiredRepositoryPermission
        )
      ).length > 0;
  }

  /**
   * Checks whether the page requires write access to the selected repository.
   */
  private requiresWriteAccess(ctx: RestrictionContext): boolean {
    return ctx.viewRestriction?.requiresWriteAccess() ?? false;
  }

  /**
   * Checks whether the page declares the given restriction condition.
   */
  private isRestrictedBy(ctx: RestrictionContext, condition: ViewRestrictionCondition): boolean {
    return ctx.viewRestriction?.isRestrictedBy(condition) ?? false;
  }

  /**
   * Checks whether the repository passes the page's repository type and permission filters.
   */
  private isRepositoryAllowed(ctx: RestrictionContext, repo: Repository): boolean {
    return this.matchesAllowedType(repo, ctx.allowedRepositoryTypes) && this.matchesRequiredPermission(repo, ctx.requiredRepositoryPermission);
  }

  /**
   * Checks the repository's type against the page's allowed types.
   * An empty or missing list means there is no type restriction.
   */
  private matchesAllowedType(repo: Repository, allowedRepositoryTypes?: RepositoryType[]): boolean {
    if (!allowedRepositoryTypes?.length) {
      return true;
    }

    return !!repo.type && allowedRepositoryTypes.includes(repo.type);
  }

  /**
   * Checks whether the user has the permission required by the page.
   * An undefined permission means there is no permission restriction.
   */
  private matchesRequiredPermission(repo: Repository, requiredRepositoryPermission?: RepositoryPermissionType): boolean {
    if (!requiredRepositoryPermission) {
      return true;
    }

    return this.authorizationService.hasRepoPermission(requiredRepositoryPermission, repo);
  }

  private info(key: string): RestrictionReason {
    return {
      severity: 'info',
      translationKey: `${TRANSLATION_PREFIX}.${key}`,
    };
  }

  private warn(key: string, translationParams?: Record<string, string>): RestrictionReason {
    return {
      severity: 'warn',
      translationKey: `${TRANSLATION_PREFIX}.${key}`,
      translationParams,
    };
  }
}

