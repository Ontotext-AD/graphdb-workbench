export interface LicenseResponse {
  installationId: string;
  present: boolean;
  valid: boolean;
  expiryDate: number;
  latestPublicationDate: number;
  licensee: string;
  maxCpuCores: number;
  typeOfUse: string;
  version: string;
  product: string;
  productType: string;
  usageRestriction: string;
  message: string;
  licenseCapabilities: string[];
}
