import { Mapper } from '../../../providers/mapper/mapper';
import {Capability, License} from '../../../models/license';
import {LicenseResponse} from '../../../models/license/response-models/license-response';
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
    const licenseCapabilities = new CapabilityListMapper().mapToModel(
      (response.licenseCapabilities ?? []).map(c => c as Capability)
    );

    return new License({
      expiryDate: response.expiryDate ? new Date(response.expiryDate) : undefined,
      latestPublicationDate: response.latestPublicationDate
        ? new Date(response.latestPublicationDate)
        : undefined,
      licensee: response.licensee || '',
      maxCpuCores: response.maxCpuCores,
      product: toProduct(response.product),
      productType: toProductType(response.productType),
      licenseCapabilities,
      version: response.version || '',
      installationId: response.installationId || '',
      valid: response.valid,
      typeOfUse: response.typeOfUse || '',
      message: response.message || '',
      present: response.present || false,
      usageRestriction: response.usageRestriction || '',
    });
  }
}
