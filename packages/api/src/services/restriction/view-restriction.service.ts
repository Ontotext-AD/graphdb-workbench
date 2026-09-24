import {Service} from '../../providers/service/service';
import {ViewRestriction, ViewRestrictionCondition} from '../../models/restrictions';
import {Repository} from '../../models/repositories';
import {service} from '../../providers';
import {RestrictionContextService} from './restriction-context.service';
import {RepositoryContextService} from '../domain/repository';
import {LicenseContextService} from '../domain/license';
import {AuthorizationService, SecurityContextService} from '../domain/security';

/**
 * Service for calculating view restrictions.
 *
 * Evaluates the conditions declared by the current view restriction and updates
 * the restriction context with the resulting restricted state.
 */
export class ViewRestrictionService implements Service {
  private readonly restrictionContextService = service(RestrictionContextService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);

  private readonly conditionCheckers: Record<ViewRestrictionCondition, () => boolean> = {
    [ViewRestrictionCondition.IS_LICENSE_INVALID]: () => this.isLicenseRestricted(),
    [ViewRestrictionCondition.MISSING_WRITE_PERMISSIONS]: () => this.isWriteRestricted(),
    [ViewRestrictionCondition.IS_ONTOP]: () => this.isOntopRestricted(),
    [ViewRestrictionCondition.IS_FEDEX]: () => this.isFedxRestricted(),
    [ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED]: () => this.isRepositoryNotSelectedRestricted(),
  };

  /**
   * Recalculates whether the view is restricted based on its declared restriction conditions and repository filters.
   *
   * The view is considered restricted when at least one of its conditions is met, or the selected repository
   * doesn't pass its repository filters.
   */
  recalculateIsRestricted(): void {
    const viewRestriction = this.restrictionContextService.viewRestriction();
    const restrictions = viewRestriction?.restrictions ?? [];
    const selectedRepository = this.repositoryContextService.getSelectedRepository();
    let isRestricted = false;

    if (restrictions.some((condition) => this.conditionCheckers[condition]())) {
      // The view is restricted when any declared restriction condition is met
      isRestricted = true;
    } else if (selectedRepository) {
      // The selected repository may not be supported by the view or may not meet its required permissions.
      isRestricted = !this.isRepositoryAllowed(selectedRepository, viewRestriction);
    }

    this.restrictionContextService.updateIsViewRestricted(isRestricted);
  }

  /**
   * Checks whether the repository meets the view's repository type and permission requirements.
   *
   * @param repository The repository to check.
   * @param viewRestriction The view restriction whose filters apply. If undefined, no filters apply.
   * @returns `true` when the repository is of an allowed type and the user has the required permission;
   * otherwise, `false`.
   */
  isRepositoryAllowed(repository: Repository, viewRestriction?: ViewRestriction): boolean {
    const allowedTypes = viewRestriction?.allowedRepositoryTypes ?? [];
    const matchesType = allowedTypes.length === 0 || (!!repository.type && allowedTypes.includes(repository.type));
    const requiredPermission = viewRestriction?.requiredRepositoryPermission;
    const matchesPermission = !requiredPermission || this.authorizationService.hasRepoPermission(requiredPermission, repository);
    return matchesType && matchesPermission;
  }

  /**
   * Checks whether the view is restricted because the current license is invalid.
   *
   * @returns `true` when the current license is invalid; otherwise, `false`.
   */
  private isLicenseRestricted(): boolean {
    return !this.licenseContextService.getLicenseSnapshot()?.valid;
  }

  /**
   * Checks whether the view is restricted because the current user cannot write to the active repository.
   *
   * When no repository is selected, there is nothing to write to, so this condition doesn't apply. That case is covered
   * by {@link ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED}.
   *
   * @returns `true` when security is enabled, a repository is selected and the user cannot write to it; otherwise,
   * `false`.
   */
  private isWriteRestricted(): boolean {
    const selectedRepository = this.repositoryContextService.getSelectedRepository();
    if (!selectedRepository) {
      return false;
    }
    const isSecurityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;
    const canWrite = this.authorizationService.canWriteRepo(selectedRepository);
    return isSecurityEnabled && !canWrite;
  }

  /**
   * Checks whether the view is restricted because the active repository is an Ontop repository.
   *
   * @returns `true` when the active repository is Ontop; otherwise, `false`.
   */
  private isOntopRestricted(): boolean {
    return this.repositoryContextService.getSelectedRepository()?.isOntop() ?? false;
  }

  /**
   * Checks whether the view is restricted because the active repository is a FedX repository.
   *
   * @returns `true` when the active repository is FedX; otherwise, `false`.
   */
  private isFedxRestricted(): boolean {
    return this.repositoryContextService.getSelectedRepository()?.isFedx() ?? false;
  }

  /**
   * Checks whether the view is restricted because no repository is selected.
   *
   * @returns `true` when no repository is selected; otherwise, `false`.
   */
  private isRepositoryNotSelectedRestricted(): boolean {
    return !this.repositoryContextService.getSelectedRepository();
  }
}
