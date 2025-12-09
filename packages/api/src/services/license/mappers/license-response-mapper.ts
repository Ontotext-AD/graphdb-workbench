import { License } from '../../../models/license';
import {LicenseResponse} from '../../../models/license/response-models/license-response';
import {mapCapabilityListToModel} from './capability-list.mapper';
import {toProduct} from '../../../models/license/product';
import {toProductType} from '../../../models/license/product-type';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper for Graph DB license response. Maps the API JSON response to {@link License}
 */
export const mapLicenseResponseToModel: MapperFn<LicenseResponse, License> = (response: LicenseResponse) => {
  const license = new License();

  license.expiryDate = response?.expiryDate ? new Date(response.expiryDate) : undefined;
  license.latestPublicationDate = response?.latestPublicationDate ? new Date(response.latestPublicationDate) : undefined;
  license.licensee = response?.licensee || '';
  license.maxCpuCores = response?.maxCpuCores;
  license.product = toProduct(response?.product);
  license.productType = toProductType(response?.productType);
  license.licenseCapabilities = mapCapabilityListToModel(response?.licenseCapabilities);
  license.version = response?.version || '';
  license.installationId = response?.installationId || '';
  license.valid = response?.valid;
  license.typeOfUse = response?.typeOfUse || '';
  license.message = response?.message || '';
  license.present = response?.present || false;
  license.usageRestriction = response?.usageRestriction || '';

  return license;
};
