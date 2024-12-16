import { LicenseMapper } from './license-mapper';
import { Capability, License } from '../../../models/license';
import { CapabilityList } from '../../../models/license';

describe('LicenseMapper', () => {
  let licenseMapper: LicenseMapper;

  beforeEach(() => {
    licenseMapper = new LicenseMapper();
  });

  test('should map all properties from JSON input data in the created License instance', () => {
    // Given: A sample JSON input data object with various properties
    const inputData: object = {
      expiryDate: 1734077569000,
      latestPublicationDate: 1734077569000,
      licensee: 'Example Company',
      maxCpuCores: 4,
      product: 'GraphDB',
      productType: 'Enterprise',
      licenseCapabilities: [Capability.CLUSTER],
      version: '1.0',
      installationId: 'inst-123',
      valid: true,
      typeOfUse: 'Production',
      message: 'Valid license'
    };

    // When: The input data is mapped to a License instance
    const result = licenseMapper.mapToModel(inputData);
    const expectedLicenseCapabilityList = new CapabilityList([Capability.CLUSTER]);

    // Then: The result should be an instance of License
    expect(result).toBeInstanceOf(License);

    // Then: The licenseCapabilities property should match the expected CapabilityList
    expect(result.licenseCapabilities).toEqual(expectedLicenseCapabilityList);
    // Then: The licenseCapabilities property should be an instance of CapabilityList
    expect(result.licenseCapabilities).toBeInstanceOf(CapabilityList);

    // Then: All other properties from the input data should be preserved
    Object.keys(inputData).forEach(key => {
      // Exclude licenseCapabilities, as it is handled separately
      if (key !== 'licenseCapabilities') {
        expect(result[key as keyof License]).toEqual(inputData[key as keyof object]);
      }
    });
  });
});
