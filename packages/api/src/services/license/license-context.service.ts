import { License } from '../../models/license';
import { ValueChangeCallback } from '../../models/context/value-change-callback';
import { ContextService } from '../context/context.service';

/**
 * Service for managing license context in the application.
 * Extends the base ContextService to provide license-specific functionality.
 */
export class LicenseContextService extends ContextService {
  private static readonly GRAPHDB_LICENSE = 'graphDbLicense';

  /**
   * Updates the license information in the context.
   * @param license - The new License object to be set in the context.
   */
  updateLicense(license: License): void {
    this.updateContextProperty(LicenseContextService.GRAPHDB_LICENSE, license);
  }

  /**
   * Subscribes to changes in the license context
   *
   * @param callbackFn - A callback function that will be called when the license changes.
   * The callback receives the updated License object or undefined as its parameter.
   * @returns A function that, when called, will unsubscribe from the license changes.
   */
  onLicenseChanged(callbackFn: ValueChangeCallback<License | undefined>): () => void {
    return this.subscribe(LicenseContextService.GRAPHDB_LICENSE, callbackFn);
  }
}
