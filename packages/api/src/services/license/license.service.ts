import {LicenseRestService} from './license-rest.service';
import {ServiceProvider} from '../../providers';
import {License} from '../../models/license';
import {LicenseMapper} from './mappers/license-mapper';
import {Service} from '../../providers/service/service';
import {LicenseContextService} from './license-context.service';

/**
 * Service class for handling license-related operations.
 */
export class LicenseService implements Service {
  private readonly licenseRestService: LicenseRestService = ServiceProvider.get(LicenseRestService);
  private readonly licenseMapper: LicenseMapper = ServiceProvider.get(LicenseMapper);

  /**
   * Retrieves the current license information.
   *
   * This function fetches the current license data from the license REST service
   * and maps the response to a License model object.
   *
   * @returns {Promise<License>} A Promise that resolves to a License object representing the current license.
   */
  getLicense(): Promise<License> {
    return this.licenseRestService.getLicense()
      .then(response => this.licenseMapper.mapToModel(response));
  }

  /**
   * Determines if the current license is a free license.
   *
   * This function checks the product type and type of use of the current license
   * to determine if it's a free license. A license is considered free if:
   * - The product type is 'free', or
   * - The type of use is `evaluation` (case-insensitive), or
   * - The type of use is `this is an evaluation license` (case-insensitive)
   *
   * @returns {boolean} True if the license is a free license, false otherwise.
   */
  isFreeLicense(): boolean {
    const license = ServiceProvider.get(LicenseContextService).getLicense();
    const licenseTypeOfUse = license?.typeOfUse?.toLowerCase() || '';
    return license?.productType === 'free'
      || licenseTypeOfUse === 'evaluation'
      || licenseTypeOfUse === 'this is an evaluation license';
  }
}
