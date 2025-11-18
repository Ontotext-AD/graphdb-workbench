import {CapabilityResponse} from '../../services/license/mappers/capability-list.mapper';

export interface LicenseResponse {
  expiryDate?: number;
  latestPublicationDate?: number;
  licensee?: string;
  maxCpuCores?: number;
  product?: string;
  productType?: string;
  licenseCapabilities?: CapabilityResponse[];
  version?: string;
  installationId?: string;
  valid?: boolean;
  typeOfUse?: string;
  message?: string;
  present?: boolean;
  usageRestriction?: string;
}
