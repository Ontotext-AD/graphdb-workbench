import {LicenseService} from '../license.service';
import {CapabilityList, License} from '../../../models/license';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {LicenseContextService} from '../license-context.service';
import {ProductType} from '../../../models/license/product-type';
import {service} from '../../../providers';
import {LicenseResponse} from '../response/license-response';
import {Product} from '../../../models/license/product';

describe('LicenseService', () => {
  let licenseService: LicenseService;

  beforeEach(() => {
    licenseService = new LicenseService();
  });

  test('should retrieve the license, mapped to a License object', async () => {
    // Given, I have a mocked license
    const mockLicense: LicenseResponse= {
      licensee: 'Test Company',
      expiryDate: 1672531200000,
      latestPublicationDate: 1672531200000,
      maxCpuCores: 4,
      product: 'GRAPHDB_LITE',
      productType: 'sandbox',
      // @ts-expect-error Testing handling of invalid data (undefined and null values)
      licenseCapabilities: ['Cluster', undefined, null],
      version: '',
      installationId: '',
      valid: true,
      typeOfUse: '',
      message: '',
      present: false,
      usageRestriction: ''
    };
    TestUtil.mockResponse(new ResponseMock('rest/graphdb-settings/license').setResponse(mockLicense));

    // When I call the getLicense method
    const result = await licenseService.getLicense();

    const expectedLicense = new License({
      licensee: 'Test Company',
      expiryDate: new Date(1672531200000),
      latestPublicationDate: new Date(1672531200000),
      maxCpuCores: 4,
      product: Product.GRAPHDB_LITE,
      productType: ProductType.SANDBOX,
      valid: true,
      present: false,
      typeOfUse: '',
      message: '',
      usageRestriction: '',
      licenseCapabilities: new CapabilityList(['Cluster']),
    });

    // Then, I should get a License object, with default property values
    expect(result).toMatchObject(expectedLicense);
  });

  test('should return a true for a trackable license', () => {
    // Given, I have a license object
    const license = new License({ productType: ProductType.FREE, expiryDate: new Date() });
    service(LicenseContextService).updateGraphdbLicense(license);

    // When I call the isTrackableLicense method
    const result = licenseService.isTrackableLicense();

    // Then, I should get true
    expect(result).toEqual(true);

    // And, when the product type is 'sandbox`, I should get true
    license.productType = ProductType.SANDBOX;
    service(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isTrackableLicense()).toEqual(true);

    // And, when the type of use is 'evaluation', I should get true
    license.typeOfUse = 'evaluation';
    license.productType = undefined;
    service(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isTrackableLicense()).toEqual(true);

    // And, when the type of use is 'this is an evaluation license', I should get true
    license.typeOfUse = 'this is an evaluation license';
    service(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isTrackableLicense()).toEqual(true);

    // And, when I don't have a license object, I should get true
    service(LicenseContextService).updateGraphdbLicense(undefined);
    expect(licenseService.isTrackableLicense()).toEqual(true);
  });

  test('should return false for a non-free license', () => {
    // Given, I have a license object
    const license = new License({ productType: ProductType.ENTERPRISE, present: true, expiryDate: new Date() });
    service(LicenseContextService).updateGraphdbLicense(license);

    // When I call the isFreeLicense method
    const result = licenseService.isTrackableLicense();

    // Then, I should get false
    expect(result).toEqual(false);

    // And, when the type of use is not 'evaluation' or 'this is an evaluation license', I should get false
    license.typeOfUse = 'something else';
    service(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isTrackableLicense()).toEqual(false);
  });

  test('should update license status with hardcoded flag and license info', async () => {
    // Given, I have mocked responses for hardcoded check and license retrieval
    const mockLicense: LicenseResponse= {
      licensee: 'Test Company',
      expiryDate: 1672531200000,
      latestPublicationDate: 1672531200000,
      maxCpuCores: 4,
      product: 'GRAPHDB_LITE',
      productType: 'enterprise',
      licenseCapabilities: ['Cluster'],
      version: '',
      installationId: '',
      valid: true,
      typeOfUse: '',
      message: '',
      present: false,
      usageRestriction: ''
    };
    TestUtil.mockResponses([
      new ResponseMock('rest/graphdb-settings/license/hardcoded').setResponse('true'),
      new ResponseMock('rest/graphdb-settings/license').setResponse(mockLicense)
    ]);

    // When I call the updateLicenseStatus method
    const result = await licenseService.updateLicenseStatus();

    // Then, the license context should be updated with the hardcoded flag
    const licenseContext = service(LicenseContextService);
    expect(licenseContext.isLicenseHardcodedSnapshot()).toEqual(true);

    // And, the license context should be updated with the license info
    const updatedLicense = licenseContext.getLicenseSnapshot();
    expect(updatedLicense?.licensee).toEqual('Test Company');
    expect(result.licensee).toEqual('Test Company');
  });

  test('should register a license with the provided license code', async () => {
    // Given, I have a license code and a mocked response
    const licenseCode = 'test-license-code-base64';
    const mockLicense: LicenseResponse= {
      licensee: 'Registered Company',
      expiryDate: 1672531200000,
      latestPublicationDate: 1672531200000,
      maxCpuCores: 4,
      product: 'GRAPHDB_LITE',
      productType: 'enterprise',
      licenseCapabilities: ['Cluster'],
      version: '',
      installationId: '',
      valid: true,
      typeOfUse: '',
      message: '',
      present: false,
      usageRestriction: ''
    };
    TestUtil.mockResponse(new ResponseMock('rest/graphdb-settings/license').setResponse(mockLicense));

    // When I call the registerLicense method
    const result = await licenseService.registerLicense(licenseCode);

    // Then, I should get a License object with the registered license details
    expect(result.licensee).toEqual('Registered Company');
    expect(result.productType).toEqual(ProductType.ENTERPRISE);
  });

  test('should unregister the current license', async () => {
    // Given, I have a mocked response for license unregistration
    TestUtil.mockResponse(new ResponseMock('rest/graphdb-settings/license').setResponse(undefined));

    // When I call the unregisterLicense method
    await licenseService.unregisterLicense();

    // Then, the method should complete without errors
    // (The test passes if no exception is thrown)
  });

  test('should extract license information from a license file', async () => {
    // Given, I have a license file and a mocked response
    const mockFile = new File(['license content'], 'license.txt', { type: 'text/plain' });
    const extractedBase64 = 'extracted-license-base64-content';
    TestUtil.mockResponse(new ResponseMock('rest/info/license/to-base-64').setResponse(extractedBase64));

    // When I call the extractFromLicenseFile method
    const result = await licenseService.extractFromLicenseFile(mockFile);

    // Then, I should get the extracted license information in base64 format
    expect(result).toEqual(extractedBase64);
  });

  test('should check if license is hardcoded', async () => {
    // Given, I have a mocked response indicating the license is hardcoded
    TestUtil.mockResponse(new ResponseMock('rest/graphdb-settings/license/hardcoded').setResponse('true'));

    // When I call the getIsLicenseHardcoded method
    const result = await licenseService.getIsLicenseHardcoded();

    // Then, I should get true
    expect(result).toEqual(true);

    // And, when the license is not hardcoded
    TestUtil.mockResponse(new ResponseMock('rest/graphdb-settings/license/hardcoded').setResponse('false'));
    const result2 = await licenseService.getIsLicenseHardcoded();

    // Then, I should get false
    expect(result2).toEqual(false);
  });

  test('should validate a license code', async () => {
    // Given, I have a license code to validate and a mocked response
    const licenseCode = 'license-code-to-validate';
    const mockLicense: LicenseResponse= {
      licensee: 'Validated Company',
      expiryDate: 1672531200000,
      latestPublicationDate: 1672531200000,
      maxCpuCores: 4,
      product: 'GRAPHDB_LITE',
      productType: 'enterprise',
      licenseCapabilities: ['Cluster'],
      version: '',
      installationId: '',
      valid: true,
      typeOfUse: '',
      message: '',
      present: false,
      usageRestriction: ''
    };
    TestUtil.mockResponse(new ResponseMock('rest/info/license/validate').setResponse(mockLicense));

    // When I call the validateLicense method
    const result = await licenseService.validateLicense(licenseCode);

    // Then, I should get a License object with the validation result
    expect(result.licensee).toEqual('Validated Company');
    expect(result.productType).toEqual(ProductType.ENTERPRISE);
  });
});
