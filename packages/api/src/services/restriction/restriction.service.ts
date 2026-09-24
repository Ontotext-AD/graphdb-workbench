import {Service} from '../../providers/service/service';
import {ViewRestriction, ViewRestrictionCondition} from '../../models/restrictions';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';
import {service} from '../../providers';
import {RestrictionContextService} from './restriction-context.service';
import {RepositoryContextService} from '../domain/repository';
import {LicenseContextService} from '../domain/license';
import {AuthorizationService, SecurityContextService} from '../domain/security';

/**
 * Generic service for calculating view restrictions.
 *
 * Evaluates the conditions declared by the current view restriction and updates
 * the restriction context with the resulting restricted state.
 */
export class RestrictionService implements Service, LifecycleHooks {
  private readonly restrictionContextService = service(RestrictionContextService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly authorizationService = service(AuthorizationService);

  private readonly conditionCheckers: Record<ViewRestrictionCondition, () => boolean> = {
    [ViewRestrictionCondition.LICENSE]: () => this.isViewLicenseRestricted(),
    [ViewRestrictionCondition.WRITE]: () => this.isViewWriteRestricted(),
    [ViewRestrictionCondition.ONTOP]: () => this.isViewOntopRestricted(),
    [ViewRestrictionCondition.FEDX]: () => this.isViewFedxRestricted(),
  };

  onCreated(): void {
    this.subscribeToRepositoryChanges();
    this.subscribeToLicenseChanges();
    this.subscribeToSecurityConfigChanges();
    this.subscribeToAuthenticatedUserChanges();
  }

  /**
   * Updates the current view restriction and recalculates whether the view is restricted.
   *
   * @param viewRestriction The view restriction containing the conditions to evaluate.
   */
  updateViewRestriction(viewRestriction: ViewRestriction): void {
    this.restrictionContextService.updateViewRestriction(viewRestriction);
    this.recalculateIsViewRestricted();
  }

  /**
   * Subscribes to selected repository changes to recalculate the view restriction.
   */
  private subscribeToRepositoryChanges(): void {
    this.repositoryContextService.onSelectedRepositoryChanged(() => this.recalculateIsViewRestricted());
  }

  /**
   * Subscribes to license changes to recalculate the view restriction.
   */
  private subscribeToLicenseChanges(): void {
    this.licenseContextService.onLicenseChanged(() => this.recalculateIsViewRestricted());
  }

  /**
   * Subscribes to security configuration changes to recalculate the view restriction.
   */
  private subscribeToSecurityConfigChanges(): void {
    this.securityContextService.onSecurityConfigChanged(() => this.recalculateIsViewRestricted());
  }

  /**
   * Subscribes to authenticated user changes to recalculate the view restriction.
   */
  private subscribeToAuthenticatedUserChanges(): void {
    this.securityContextService.onAuthenticatedUserChanged(() => this.recalculateIsViewRestricted());
  }

  /**
   * Recalculates whether the view is restricted based on its declared restriction conditions.
   *
   * The view is considered restricted when at least one of its conditions is satisfied.
   */
  private recalculateIsViewRestricted(): void {
    const restrictions = this.restrictionContextService.viewRestriction()?.restrictions ?? [];
    const isViewRestricted = restrictions.some((condition) => this.conditionCheckers[condition]());
    this.restrictionContextService.updateIsViewRestricted(isViewRestricted);
  }

  /**
   * Checks whether the view is restricted because the current license is invalid.
   *
   * @returns `true` when the current license is invalid; otherwise, `false`.
   */
  private isViewLicenseRestricted(): boolean {
    return !this.licenseContextService.getLicenseSnapshot()?.valid;
  }

  /**
   * Checks whether the view is restricted because the current user cannot write to the active repository.
   *
   * @returns `true` when security is enabled and the user cannot write to the active repository; otherwise, `false`.
   */
  private isViewWriteRestricted(): boolean {
    const isSecurityEnabled = this.securityContextService.getSecurityConfig()?.isEnabled() ?? false;
    const canWrite = this.authorizationService.canWriteRepo(this.repositoryContextService.getSelectedRepository());
    return isSecurityEnabled && !canWrite;
  }

  /**
   * Checks whether the view is restricted because the active repository is an Ontop repository.
   *
   * @returns `true` when the active repository is Ontop; otherwise, `false`.
   */
  private isViewOntopRestricted(): boolean {
    return this.repositoryContextService.getSelectedRepository()?.isOntop() ?? false;
  }

  /**
   * Checks whether the view is restricted because the active repository is a FedX repository.
   *
   * @returns `true` when the active repository is FedX; otherwise, `false`.
   */
  private isViewFedxRestricted(): boolean {
    return this.repositoryContextService.getSelectedRepository()?.isFedx() ?? false;
  }
}
