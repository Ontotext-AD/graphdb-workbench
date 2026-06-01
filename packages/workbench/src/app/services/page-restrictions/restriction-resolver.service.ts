import {inject, Injectable} from '@angular/core';
import {TranslocoService} from '@jsverse/transloco';
import {
  AuthorizationService,
  LicenseContextService,
  Repository,
  SecurityContextService,
  service,
} from '@ontotext/workbench-api';
import {RestrictionReason} from './restriction-reason';

export interface RestrictionContext {
  selectedRepository: Repository | undefined;
  isRestricted: boolean;
  pageTitle: string;
  ctaKey?: string;
  ctaLink?: string;
}

@Injectable({ providedIn: 'root' })
export class RestrictionResolverService {
  private readonly transloco = inject(TranslocoService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);

  resolve(ctx: RestrictionContext): RestrictionReason[] {
    const repo = ctx.selectedRepository;
    const isLicenseValid = this.licenseContextService.getLicenseSnapshot()?.valid ?? false;
    const isSecurityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;
    const canWrite = this.authorizationService.canWriteRepo(repo);
    const canManage = this.authorizationService.isRepoManager();
    const accessibleRepositoriesCount = this.authorizationService.getAccessibleRepositories(true, ctx.isRestricted).size();
    const hasAccessibleRepositories = accessibleRepositoriesCount > 0;

    const reasons: RestrictionReason[] = [];

    if (!repo && isLicenseValid) {
      if (canManage && !hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_accessible_repos_create_one',
        });
      } else if (canManage && hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_active_repository_select_or_create_one',
        });
      } else if (!canManage && hasAccessibleRepositories) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_active_repository_select_one',
        });
      }
    }

    if (repo) {
      if (isSecurityEnabled && !canWrite) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.no_write_permission',
          translationParams: { repositoryId: repo.id },
        });
      }

      if (canWrite && repo.isOntop()) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.read_only_ontop',
          translationParams: {repositoryId: repo.id},
        });
      }

      if (canWrite && repo.isFedx()) {
        reasons.push({
          severity: 'warn',
          translationKey: 'components.page_restrictions.fedx_unsupported',
          translationParams: {pageTitle: ctx.pageTitle},
        });
      }
    }

    if (!isLicenseValid) {
      reasons.push({
        severity: 'warn',
        translationKey: 'components.page_restrictions.invalid_license',
        ctaKey: 'components.page_restrictions.set_new_license',
        ctaLink: '/license',
      });
    }

    if (!hasAccessibleRepositories) {
      if (ctx.isRestricted) {
        reasons.push({
          severity: 'info',
          translationKey: 'components.page_restrictions.no_accessible_writable_repos',
        });
      }
    }

    return reasons;
  }
}
