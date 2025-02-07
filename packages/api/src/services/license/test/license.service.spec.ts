import { LicenseService } from '../license.service';
import { License } from '../../../models/license';
import { TestUtil } from '../../utils/test/test-util';
import { ResponseMock } from '../../http/test/response-mock';
import {ServiceProvider} from '../../../providers';
import {LicenseContextService} from '../license-context.service';

describe('LicenseService', () => {
  let licenseService: LicenseService;

  beforeEach(() => {
    licenseService = new LicenseService();
  });

  test('should retrieve the license, mapped to a License object', async () => {
    // Given, I have a mocked license
    const mockLicense = { licensee: 'Test Company', expiryDate: 1672531200000 } as License;
    TestUtil.mockResponse(new ResponseMock('/rest/graphdb-settings/license').setResponse(mockLicense));

    // When I call the getLicense method
    const result = await licenseService.getLicense();

    const expectedLicense = {
      licensee: 'Test Company',
      expiryDate: 1672531200000,
      product: '',
      productType: '',
      version: '',
      installationId: '',
      valid: undefined,
      typeOfUse: '',
      message: '',
      latestPublicationDate: undefined,
      maxCpuCores: undefined,
      licenseCapabilities: {
        items: []
      },
    };

    // Then, I should get a License object, with default property values
    expect(result).toEqual(expectedLicense);
  });

  test('should return a true for a free license', () => {
    // Given, I have a license object
    const license = new License({ productType: 'free', expiryDate: new Date().getTime() });
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);

    // When I call the isFreeLicense method
    const result = licenseService.isFreeLicense();

    // Then, I should get true
    expect(result).toEqual(true);

    // And, when the type of use is 'evaluation', I should get true
    license.typeOfUse = 'evaluation';
    license.productType = '';
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isFreeLicense()).toEqual(true);

    // And, when the type of use is 'this is an evaluation license', I should get true
    license.typeOfUse = 'this is an evaluation license';
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isFreeLicense()).toEqual(true);
  });

  test('should return false for a non-free license', () => {
    // Given, I have a license object
    const license = new License({ productType: 'paid', expiryDate: new Date().getTime() });
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);

    // When I call the isFreeLicense method
    const result = licenseService.isFreeLicense();

    // Then, I should get false
    expect(result).toEqual(false);

    // And, when the type of use is not 'evaluation' or 'this is an evaluation license', I should get false
    license.typeOfUse = 'something else';
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);
    expect(licenseService.isFreeLicense()).toEqual(false);
  });
});
