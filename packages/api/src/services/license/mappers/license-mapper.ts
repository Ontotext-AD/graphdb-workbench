import { Mapper } from '../../../providers/mapper/mapper';
import {Capability, License} from '../../../models/license';
import {CapabilityListMapper} from './capability-list.mapper';
import { toObject, ensureArray } from '../../../providers/mapper/guards';

interface LicenseApi {
  expiryDate?: number;
  latestPublicationDate?: number;
  licensee?: string;
  maxCpuCores?: number;
  product?: string;
  productType?: string;
  licenseCapabilities?: Capability[];
  version?: string;
  installationId?: string;
  valid?: boolean;
  typeOfUse?: string;
  message?: string;
  present?: boolean;
  usageRestriction?: string;
}

/**
 * Mapper for Graph DB license object. Maps the API JSON response to {@link License}
 */
export class LicenseMapper extends Mapper<License> {
  private static readonly capabilityListMapper = new CapabilityListMapper();

  /**
   * Map to {@link License} object
   *
   * @param {unknown} data - The raw representation of the license object
   * @returns {License} - A new License instance
   */
  mapToModel(data: unknown): License {
    if (data instanceof License) {
      return data;
    }
    const src = toObject<LicenseApi>(data);
    const capabilitiesRaw = ensureArray<Capability>(src.licenseCapabilities);
    const capabilityList = LicenseMapper.capabilityListMapper.mapToModel(capabilitiesRaw);
    return new License({ ...src, licenseCapabilities: capabilityList });
  }
}
