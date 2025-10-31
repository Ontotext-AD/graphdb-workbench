import { Mapper } from '../../../providers/mapper/mapper';
import { License } from '../../../models/license';
import {LicenseResponse} from '../../../models/license/response-models/license-response';
import {MapperProvider} from '../../../providers';
import {CapabilityListMapper} from './capability-list.mapper';
import {toProduct} from '../../../models/license/product';
import {toProductType} from '../../../models/license/product-type';

/**
 * Mapper for Graph DB license response. Maps the API JSON response to {@link License}
 */
export class LicenseResponseMapper extends Mapper<License> {

  /**
   * Map to {@link License} object
   *
   * @param {Partial<License>} response - The raw representation of the license object
   * @returns {License} - A new License instance
   */
  mapToModel(response: LicenseResponse): License {
    const license = new License();

    license.expiryDate = response?.expiryDate ? new Date(response.expiryDate) : undefined;
    license.latestPublicationDate = response?.latestPublicationDate ? new Date(response.latestPublicationDate) : undefined;
    license.licensee = response?.licensee || '';
    license.maxCpuCores = response?.maxCpuCores;
    license.product = toProduct(response?.product);
    license.productType = toProductType(response?.productType);
    license.licenseCapabilities = MapperProvider.get(CapabilityListMapper).mapToModel(response?.licenseCapabilities);
    license.version = response?.version || '';
    license.installationId = response?.installationId || '';
    license.valid = response?.valid;
    license.typeOfUse = response?.typeOfUse || '';
    license.message = response?.message || '';
    license.present = response?.present || false;
    license.usageRestriction = response?.usageRestriction || '';

    return license;
  }
}
