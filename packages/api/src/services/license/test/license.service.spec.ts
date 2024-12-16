import { LicenseService } from '../license.service';
import { License } from '../../../models/license';
import { TestUtil } from '../../utils/test/test-util';
import { ResponseMock } from '../../http/test/response-mock';

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
});
