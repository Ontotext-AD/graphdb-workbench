import {Capability, CapabilityList, License} from '../../../models/license';
import {LicenseResponse} from '../response/license-response';
import {toProduct} from '../../../models/license/product';
import {toProductType} from '../../../models/license/product-type';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper for Graph DB license response. Maps the API JSON response to {@link License}
 */
export const mapLicenseResponseToModel: MapperFn<LicenseResponse, License> = (response: LicenseResponse) => {
  return new License(
    {
      expiryDate: response?.expiryDate ? new Date(response.expiryDate) : undefined,
      latestPublicationDate: response?.latestPublicationDate ? new Date(response.latestPublicationDate) : undefined,
      licensee: response?.licensee || '',
      maxCpuCores: response?.maxCpuCores,
      product: toProduct(response?.product),
      productType: toProductType(response?.productType),
      licenseCapabilities: mapCapabilityListToModel(response?.licenseCapabilities),
      version: response?.version || '',
      installationId: response?.installationId || '',
      valid: response?.valid,
      typeOfUse: response?.typeOfUse || '',
      message: response?.message || '',
      present: response?.present || false,
      usageRestriction: response?.usageRestriction || '',
    }
  );
};

/**
 * Mapper for converting an array of Capability objects to a CapabilityList model.
 */
function mapCapabilityListToModel(data: string[]): CapabilityList {
  const capabilities = (data ?? [])
    .map(toCapability)
    .filter((c): c is Capability => c !== undefined);
  return new CapabilityList(capabilities);
}

function toCapability(value: string): Capability | undefined {
  const match = Object.values(Capability).find((cap) => cap === value);
  return match ?? undefined;
}
