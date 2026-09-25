import {Service} from '../../providers/service/service';
import {ViewRestriction, ViewRestrictionCondition} from '../../models/restrictions';
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
    [ViewRestrictionCondition.LICENSE]: () => this.isLicenseRestricted(),
    [ViewRestrictionCondition.WRITE]: () => this.isWriteRestricted(),
    [ViewRestrictionCondition.ONTOP]: () => this.isOntopRestricted(),
    [ViewRestrictionCondition.FEDX]: () => this.isFedxRestricted(),
  };

  /**
   * Updates the current view restriction and recalculates whether the view is restricted.
   *
   * @param restriction The view restriction containing the conditions to evaluate.
   */
  updateRestriction(restriction: ViewRestriction): void {
    this.restrictionContextService.updateViewRestriction(restriction);
    this.recalculateIsRestricted();
  }

  /**
   * Recalculates whether the view is restricted based on its declared restriction conditions.
   *
   * The view is considered restricted when at least one of its conditions is satisfied.
   */
  recalculateIsRestricted(): void {
    const restrictions = this.restrictionContextService.viewRestriction()?.restrictions ?? [];
    const isRestricted = restrictions.some((condition) => this.conditionCheckers[condition]());
    this.restrictionContextService.updateIsViewRestricted(isRestricted);
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
   * @returns `true` when security is enabled and the user cannot write to the active repository; otherwise, `false`.
   */
  private isWriteRestricted(): boolean {
    const isSecurityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;
    const canWrite = this.authorizationService.canWriteRepo(this.repositoryContextService.getSelectedRepository());
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
}
