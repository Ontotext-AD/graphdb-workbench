import { LicenseRestService } from './license-rest.service';
import { ServiceProvider } from '../../providers';
import { License } from '../../models/license';
import { LicenseMapper } from './mappers/license-mapper';
import { Service } from '../../providers/service/service';

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
}
