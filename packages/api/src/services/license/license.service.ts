import {LicenseRestService} from './license-rest.service';
import {service} from '../../providers';
import {License} from '../../models/license';
import {mapLicenseResponseToModel} from './mappers/license-response-mapper';
import {Service} from '../../providers/service/service';
import {LicenseContextService} from './license-context.service';
import {ProductType} from '../../models/license/product-type';

/**
 * Service class for handling license-related operations.
 */
export class LicenseService implements Service {
  private readonly licenseRestService = service(LicenseRestService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly trackableProductTypes = [ProductType.FREE, ProductType.SANDBOX];
  private readonly trackableTypesOfUse = ['evaluation', 'this is an evaluation license'];

  async updateLicenseStatus(): Promise<License> {
    const isHardcoded = await this.getIsLicenseHardcoded();
    this.licenseContextService.updateIsLicenseHardcoded(isHardcoded);
    const license = await this.getLicense();
    this.licenseContextService.updateGraphdbLicense(license);
    return license;
  }

  /**
   * Retrieves the current license information.
   *
   * This function fetches the current license data from the license REST service
   * and maps the response to a License model object.
   *
   * @returns {Promise<License>} A Promise that resolves to a License object representing the current license.
   */
  async getLicense(): Promise<License> {
    const response = await this.licenseRestService.getLicense();
    return mapLicenseResponseToModel(response);
  }

  /**
   * Registers a new license using the provided license code.
   *
   * This function sends the given license code to the license REST service for registration
   * and maps the response to a License model object.
   *
   * @param {string} licenseCode - The license code as a base64 encoded string to be registered.
   * @returns {Promise<License>} A Promise that resolves to a License object representing the registered license.
   */
  registerLicense(licenseCode: string): Promise<License> {
    return this.licenseRestService.registerLicense(licenseCode)
      .then((response) => mapLicenseResponseToModel(response));
  }

  /**
   * Unregisters the current license.
   * @returns A Promise that resolves when the license has been unregistered.
   */
  unregisterLicense(): Promise<void> {
    return this.licenseRestService.unregisterLicense();
  }

  /**
   * Extracts license information from a given license file.
   *
   * This function uploads the provided license file to the license REST service
   * and retrieves the extracted license information in base64 format.
   * @param {File} file - The license file to be uploaded and processed.
   * @returns {Promise<string>} A Promise that resolves to a string containing the extracted license information in base64 format.
   */
  extractFromLicenseFile(file: File): Promise<string> {
    return this.licenseRestService.extractFromLicenseFile(file);
  }

  /**
   * Checks if the license is hardcoded.
   *
   * This function queries the license REST service to determine if the current license
   * is hardcoded in the system.
   *
   * @returns {Promise<boolean>} A Promise that resolves to true if the license is hardcoded, false otherwise.
   */
  getIsLicenseHardcoded(): Promise<boolean> {
    return this.licenseRestService.getIsLicenseHardcoded();
  }

  /**
   * Validates a given license code.
   *
   * This function sends the provided license code to the license REST service for validation
   * and maps the response to a License model object.
   *
   * @param {string} licenseCode - The license code as a base64 encoded string to be validated.
   * @returns {Promise<License>} A Promise that resolves to a License object representing the validated license.
   */
  validateLicense(licenseCode: string): Promise<License> {
    return this.licenseRestService.validateLicense(licenseCode)
      .then((response) => mapLicenseResponseToModel(response));
  }

  /**
   * Determines if the current license can be tracked.
   *
   * This function checks the product type and type of use of the current license
   * to determine if it's a trackable license. A license is considered trackable if:
   * - A license is not present, or
   * - The product type is 'free', or
   * - The product type is `sandbox`, or
   * - The type of use is `evaluation` (case-insensitive), or
   * - The type of use is `this is an evaluation license` (case-insensitive)
   *
   * @returns {boolean} True if the license is a free license, false otherwise.
   */
  isTrackableLicense(): boolean {
    const license = this.licenseContextService.getLicenseSnapshot();
    const licenseTypeOfUse = license?.typeOfUse?.toLowerCase() || '';
    const productType = license?.productType;
    return !license?.present
      || this.trackableProductTypes.some((pT) => pT === productType)
      || this.trackableTypesOfUse.includes(licenseTypeOfUse);
  }
}
