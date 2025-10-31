import {License} from '../../models/license';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';

type LicenseContextFields = {
  readonly GRAPHDB_LICENSE: string;
  readonly IS_LICENSE_HARDCODED: string;
}

type LicenseContextFieldParams = {
  readonly GRAPHDB_LICENSE: License;
  readonly IS_LICENSE_HARDCODED: boolean;
};

/**
 * Service for managing license context in the application.
 * Extends the base ContextService to provide license-specific functionality.
 */
export class LicenseContextService extends ContextService<LicenseContextFields> implements DeriveContextServiceContract<LicenseContextFields, LicenseContextFieldParams>, LifecycleHooks {
  readonly GRAPHDB_LICENSE = 'graphDbLicense';
  readonly IS_LICENSE_HARDCODED = 'isLicenseHardcoded';

  /**
   * Updates the license information in the context.
   * @param license - The new License object to be set in the context.
   */
  updateGraphdbLicense(license: License | undefined): void {
    this.updateContextProperty(this.GRAPHDB_LICENSE, license);
  }

  /**
   * Subscribes to changes in the license context
   *
   * @param callbackFn - A callback function that will be called when the license changes.
   * The callback receives the updated License object or undefined as its parameter.
   * @returns A function that, when called, will unsubscribe from the license changes.
   */
  onLicenseChanged(callbackFn: ValueChangeCallback<License | undefined>): () => void {
    return this.subscribe(this.GRAPHDB_LICENSE, callbackFn);
  }

  /**
   * Retrieves the license information from the context.
   *
   * @return the license information or undefined, if there is no license.
   */
  getLicenseSnapshot(): License | undefined {
    return this.getContextPropertyValue(this.GRAPHDB_LICENSE);
  }

  /**
   * Updates whether the license is hardcoded in the context.
   * @param isLicenseHardcoded
   */
  updateIsLicenseHardcoded(isLicenseHardcoded: boolean | undefined): void {
    this.updateContextProperty(this.IS_LICENSE_HARDCODED, !!isLicenseHardcoded);
  }

  /**
   * Subscribes to changes in the hardcoded license status.
   *
   * @param callbackFn - A callback function that will be called when the hardcoded license status changes.
   * @returns A function that, when called, will unsubscribe from the hardcoded license status changes.
   */
  onIsLicenseHardcodedChanged(callbackFn: ValueChangeCallback<boolean | undefined>): () => void {
    return this.subscribe(this.IS_LICENSE_HARDCODED, callbackFn);
  }

  /**
   * Retrieves whether the license is hardcoded from the context.
   *
   * @return true if the license is hardcoded, false otherwise, or undefined if not set.
   */
  isLicenseHardcodedSnapshot(): boolean | undefined {
    return this.getContextPropertyValue(this.IS_LICENSE_HARDCODED);
  }
}
