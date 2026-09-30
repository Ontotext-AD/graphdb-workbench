import {inject, Injectable} from '@angular/core';
import {
  AuthorizationService,
  LicenseContextService,
  Repository,
  RepositoryService,
  SecurityContextService,
  service,
  ViewRestrictionCondition,
  ViewRestrictionService,
} from '@ontotext/workbench-api';
import {RestrictionReason} from './restriction-reason';
import {RestrictionContext} from './model/restriction-context';
import {TranslocoService} from '@jsverse/transloco';

const TRANSLATION_PREFIX = 'components.page_restrictions';

@Injectable({providedIn: 'root'})
export class RestrictionResolverService {
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);
  private readonly repositoryService = service(RepositoryService);
  private readonly viewRestrictionService = service(ViewRestrictionService);
  private readonly translocoService = inject(TranslocoService);

  resolve(ctx: RestrictionContext): RestrictionReason[] {
    const selectedRepositoryReasons = ctx.selectedRepository ? this.getSelectedRepositoryReasons(ctx, ctx.selectedRepository) : [];
    const isLicenseRestricted = this.isLicenseRestricted(ctx);
    const hasAccessibleRepositories = this.hasAccessibleRepositories(ctx);
    const reasons: RestrictionReason[] = [];

    if (isLicenseRestricted) {
      reasons.push({
        ...this.warn('invalid_license'),
        actionLabelKey: `${TRANSLATION_PREFIX}.set_new_license`,
        actionLink: '/license',
      });
    }

    const hasNoWritableRepositories = !hasAccessibleRepositories && this.requiresWriteAccess(ctx);
    if (hasNoWritableRepositories) {
      reasons.push(this.info('no_accessible_writable_repos'));
    }

    if (selectedRepositoryReasons.length) {
      // The declared conditions explain why the selected repository can't be used.
      reasons.push(...selectedRepositoryReasons);
    } else if (!hasNoWritableRepositories && this.isRepositoryPickerRequired(ctx)) {
      // Nothing (usable) is selected. Avoid adding a redundant reason when the absence of writable repositories is already reported.
      reasons.push(this.getNoSelectedRepositoryReason(hasAccessibleRepositories));
    }

    return reasons;
  }

  /**
   * Checks whether the user has to pick another repository, so the repository picker should be shown.
   *
   * That is the case when the page requires a selected repository and none is selected, or when the selected
   * repository can't be used on the page: it doesn't pass the page's repository filters, or it is restricted by
   * a declared condition (missing write permission, Ontop or FedX). An invalid license doesn't require picking
   * another repository, as it applies to all of them.
   */
  isRepositoryPickerRequired(ctx: RestrictionContext): boolean {
    const repo = ctx.selectedRepository;
    if (!repo) {
      return this.requiresSelectedRepository(ctx);
    }
    return !this.isRepositoryAllowed(ctx, repo) || this.getSelectedRepositoryReasons(ctx, repo).length > 0;
  }

  /**
   * Resolves the message shown when no repository is selected, based on whether
   * the user can pick an existing repository and whether they can create one.
   *
   * Creating a repository requires repository management rights and a valid license,
   * the same as the create button in the repository picker.
   */
  private getNoSelectedRepositoryReason(hasAccessibleRepositories: boolean): RestrictionReason {
    const canCreateRepository = this.authorizationService.isRepoManager() && this.isLicenseValid();

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

    if (this.isRestrictedBy(ctx, ViewRestrictionCondition.IS_ONTOP) && repo.isOntop()) {
      return [
        this.warn('read_only_ontop', {
          repositoryId: repo.id,
        }),
      ];
    }

    if (this.isRestrictedBy(ctx, ViewRestrictionCondition.IS_FEDEX) && repo.isFedx()) {
      return [
        this.warn('fedx_unsupported', {
          pageTitle: this.translocoService.translate(ctx.pageTitle),
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
    return this.isRestrictedBy(ctx, ViewRestrictionCondition.IS_LICENSE_INVALID) && !this.isLicenseValid();
  }

  /**
   * Checks whether the current license is valid.
   */
  private isLicenseValid(): boolean {
    return this.licenseContextService.getLicenseSnapshot()?.valid ?? false;
  }

  /**
   * Checks whether there is at least one repository the user can pick on this page.
   *
   * The repository must be accessible, writable when required, and satisfy the
   * page's repository type and permission filters.
   */
  private hasAccessibleRepositories(ctx: RestrictionContext): boolean {
    return this.repositoryService
      .getAccessibleRepositories(true, this.requiresWriteAccess(ctx))
      .getItems()
      .some((repository) => this.isRepositoryAllowed(ctx, repository));
  }

  /**
   * Checks whether the repository passes the page's repository type and permission filters.
   */
  private isRepositoryAllowed(ctx: RestrictionContext, repository: Repository): boolean {
    return this.viewRestrictionService.isRepositoryAllowed(repository, ctx.viewRestriction);
  }

  /**
   * Checks whether the page requires write access to the selected repository.
   */
  private requiresWriteAccess(ctx: RestrictionContext): boolean {
    return ctx.viewRestriction?.requiresWriteAccess() ?? false;
  }

  /**
   * Checks whether the page requires a selected repository.
   */
  private requiresSelectedRepository(ctx: RestrictionContext): boolean {
    return ctx.viewRestriction?.requiresSelectedRepository() ?? false;
  }

  /**
   * Checks whether the page declares the given restriction condition.
   */
  private isRestrictedBy(ctx: RestrictionContext, condition: ViewRestrictionCondition): boolean {
    return ctx.viewRestriction?.isRestrictedBy(condition) ?? false;
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

