import {LicenseResponseMapper} from './license-response-mapper';
import {Capability, CapabilityList, License} from '../../../models/license';
import {LicenseResponse} from '../../../models/license/response-models/license-response';
import {Product} from '../../../models/license/product';
import {ProductType} from '../../../models/license/product-type';

describe('LicenseResponseMapper', () => {
  let licenseMapper: LicenseResponseMapper;

  beforeEach(() => {
    licenseMapper = new LicenseResponseMapper();
  });

  test('should map all properties from JSON input data in the created License instance', () => {
    // Given: A sample JSON input data object with various properties
    const inputData: LicenseResponse = {
      present: false,
      usageRestriction: '',
      expiryDate: 1734077569000,
      latestPublicationDate: 1734077569000,
      licensee: 'Example Company',
      maxCpuCores: 4,
      product: 'GRAPHDB_LITE',
      productType: 'enterprise',
      licenseCapabilities: ['Cluster'],
      version: '1.0',
      installationId: 'inst-123',
      valid: true,
      typeOfUse: 'Production',
      message: 'Valid license'
    };

    const expectedLicense = new License({
      present: false,
      usageRestriction: '',
      expiryDate: new Date(1734077569000),
      latestPublicationDate: new Date(1734077569000),
      licensee: 'Example Company',
      maxCpuCores: 4,
      product: Product.GRAPHDB_LITE,
      productType: ProductType.ENTERPRISE,
      licenseCapabilities: new CapabilityList([Capability.CLUSTER]),
      version: '1.0',
      installationId: 'inst-123',
      valid: true,
      typeOfUse: 'Production',
      message: 'Valid license'
    });

    // When: The input data is mapped to a License instance
    const result = licenseMapper.mapToModel(inputData);
    const expectedLicenseCapabilityList = new CapabilityList([Capability.CLUSTER]);

    // Then: The result should be an instance of License
    expect(result).toBeInstanceOf(License);

    // Then: The licenseCapabilities property should match the expected CapabilityList
    expect(result.licenseCapabilities).toEqual(expectedLicenseCapabilityList);
    // Then: The licenseCapabilities property should be an instance of CapabilityList
    expect(result.licenseCapabilities).toBeInstanceOf(CapabilityList);
    // Then: The license should be the expected
    expect(result).toEqual(expectedLicense);
  });
});
