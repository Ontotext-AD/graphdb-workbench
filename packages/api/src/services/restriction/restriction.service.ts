import {Service} from '../../providers/service/service';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';
import {service} from '../../providers';
import {ViewRestrictionService} from './view-restriction.service';
import {RepositoryContextService} from '../domain/repository';
import {LicenseContextService} from '../domain/license';
import {SecurityContextService} from '../domain/security';
import {RestrictionContextService} from './restriction-context.service';

/**
 * Service for restrictions.
 *
 * Delegates the restriction calculations to the specialized restriction services and triggers
 * a recalculation whenever the state they depend on changes.
 */
export class RestrictionService implements Service, LifecycleHooks {
  private readonly viewRestrictionService = service(ViewRestrictionService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly restrictionContextService = service(RestrictionContextService);

  onCreated(): void {
    this.subscribeToRepositoryChanges();
    this.subscribeToLicenseChanges();
    this.subscribeToSecurityConfigChanges();
    this.subscribeToAuthenticatedUserChanges();
    this.subscribeToViewRestrictionChanges();
  }

  /**
   * Subscribes to selected repository changes to recalculate the view restriction.
   */
  private subscribeToRepositoryChanges(): void {
    this.repositoryContextService.onSelectedRepositoryChanged(() => this.viewRestrictionService.recalculateIsRestricted());
  }

  /**
   * Subscribes to license changes to recalculate the view restriction.
   */
  private subscribeToLicenseChanges(): void {
    this.licenseContextService.onLicenseChanged(() => this.viewRestrictionService.recalculateIsRestricted());
  }

  /**
   * Subscribes to security configuration changes to recalculate the is view restriction.
   */
  private subscribeToSecurityConfigChanges(): void {
    this.securityContextService.onSecurityConfigChanged(() => this.viewRestrictionService.recalculateIsRestricted());
  }

  /**
   * Subscribes to authenticated user changes to recalculate the is view restriction.
   */
  private subscribeToAuthenticatedUserChanges(): void {
    this.securityContextService.onAuthenticatedUserChanged(() => this.viewRestrictionService.recalculateIsRestricted());
  }

  /**
   * Subscribes to view restriction changes to recalculate the is view restriction.
   */
  private subscribeToViewRestrictionChanges(): void {
    this.restrictionContextService.onViewRestrictionChanged(() => this.viewRestrictionService.recalculateIsRestricted());
  }
}
