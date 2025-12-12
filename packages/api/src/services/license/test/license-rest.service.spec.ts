import {LicenseRestService} from '../license-rest.service';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {LicenseResponse} from '../response/license-response';

describe('LicenseRestService', () => {
  let licenseRestService: LicenseRestService;

  beforeEach(() => {
    licenseRestService = new LicenseRestService();
  });

  afterEach(() => {
    TestUtil.restoreAllMocks();
  });

  describe('getLicense', () => {
    test('should send GET request to retrieve license information', async () => {
      // Given, I have a license response
      const url = 'rest/graphdb-settings/license';
      const mockLicenseResponse: LicenseResponse = {
        installationId: 'test-id',
        present: true,
        valid: true,
        expiryDate: 1672531200000,
        latestPublicationDate: 1672531200000,
        licensee: 'Test Company',
        maxCpuCores: 4,
        typeOfUse: 'Production',
        version: '1.0',
        product: 'GRAPHDB_ENTERPRISE',
        productType: 'enterprise',
        usageRestriction: '',
        message: 'Valid license',
        licenseCapabilities: []
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockLicenseResponse));

      // When, I call getLicense
      const result = await licenseRestService.getLicense();

      // Then, I expect the license to be returned
      expect(result).toEqual(mockLicenseResponse);
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('GET');
    });
  });

  describe('getIsLicenseHardcoded', () => {
    test('should send GET request to check if license is hardcoded', async () => {
      // Given, I have a hardcoded status response
      const url = 'rest/graphdb-settings/license/hardcoded';
      const mockResponse = true;

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call getIsLicenseHardcoded
      const result = await licenseRestService.getIsLicenseHardcoded();

      // Then, I expect the hardcoded status to be returned
      expect(result).toEqual(mockResponse);
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('GET');
    });

    test('should return false when license is not hardcoded', async () => {
      // Given, I have a hardcoded status response indicating false
      const url = 'rest/graphdb-settings/license/hardcoded';
      const mockResponse = false;

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockResponse));

      // When, I call getIsLicenseHardcoded
      const result = await licenseRestService.getIsLicenseHardcoded();

      // Then, I expect false to be returned
      expect(result).toEqual(false);
    });
  });

  describe('registerLicense', () => {
    test('should send POST request to register a license with correct headers', async () => {
      // Given, I have a license code to register
      const url = 'rest/graphdb-settings/license';
      const licenseCode = 'test-license-code-123';
      const mockLicenseResponse: LicenseResponse = {
        installationId: 'registered-id',
        present: true,
        valid: true,
        expiryDate: 1704067200000,
        latestPublicationDate: 1704067200000,
        licensee: 'Registered Company',
        maxCpuCores: 8,
        typeOfUse: 'Production',
        version: '1.0',
        product: 'GRAPHDB_ENTERPRISE',
        productType: 'enterprise',
        usageRestriction: '',
        message: 'License registered successfully',
        licenseCapabilities: []
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockLicenseResponse));

      // When, I call registerLicense
      const result = await licenseRestService.registerLicense(licenseCode);

      // Then, I expect the registered license to be returned
      expect(result).toEqual(mockLicenseResponse);
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('POST');
      expect(request?.headers).toEqual(expect.objectContaining({
        'Content-Type': 'application/octet-stream'
      }));
    });

    test('should convert license code string to Uint8Array', async () => {
      // Given, I have a license code
      const url = 'rest/graphdb-settings/license';
      const licenseCode = 'ABC';
      const mockLicenseResponse: LicenseResponse = {
        installationId: 'test-id',
        present: true,
        valid: true,
        expiryDate: 1672531200000,
        latestPublicationDate: 1672531200000,
        licensee: 'Test Company',
        maxCpuCores: 4,
        typeOfUse: 'Production',
        version: '1.0',
        product: 'GRAPHDB_ENTERPRISE',
        productType: 'enterprise',
        usageRestriction: '',
        message: '',
        licenseCapabilities: []
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockLicenseResponse));

      // When, I call registerLicense
      await licenseRestService.registerLicense(licenseCode);

      // Then, the body should be a Uint8Array
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      const body = request?.body;
      expect(body).toBeInstanceOf(Uint8Array);
      expect((body as Uint8Array).length).toBe(licenseCode.length);
      expect((body as Uint8Array)[0]).toBe(licenseCode.charCodeAt(0));
      expect((body as Uint8Array)[1]).toBe(licenseCode.charCodeAt(1));
      expect((body as Uint8Array)[2]).toBe(licenseCode.charCodeAt(2));
    });
  });

  describe('unregisterLicense', () => {
    test('should send DELETE request to unregister the license', async () => {
      // Given, I have a license to unregister
      const url = 'rest/graphdb-settings/license';

      TestUtil.mockResponse(new ResponseMock(url).setResponse(undefined));

      // When, I call unregisterLicense
      await licenseRestService.unregisterLicense();

      // Then, I expect a DELETE request to be sent
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('DELETE');
    });
  });

  describe('extractFromLicenseFile', () => {
    test('should send POST request with file to extract license', async () => {
      // Given, I have a license file
      const url = 'rest/info/license/to-base-64';
      const mockFile = new File(['license content'], 'license.txt', {type: 'text/plain'});
      const mockBase64Response = 'base64-encoded-license-content';

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockBase64Response));

      // When, I call extractFromLicenseFile
      const result = await licenseRestService.extractFromLicenseFile(mockFile);

      // Then, I expect the base64 encoded license to be returned
      expect(result).toEqual(mockBase64Response);
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('POST');
      expect(request?.headers).toEqual(expect.objectContaining({
        'Accept': 'text/plain'
      }));
    });

    test('should upload file with correct form data', async () => {
      // Given, I have a license file
      const url = 'rest/info/license/to-base-64';
      const mockFile = new File(['test content'], 'test.license', {type: 'application/octet-stream'});
      const mockBase64Response = 'base64-content';

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockBase64Response));

      // When, I call extractFromLicenseFile
      await licenseRestService.extractFromLicenseFile(mockFile);

      // Then, the body should be FormData
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      const body = request?.body;
      expect(body).toBeInstanceOf(FormData);
    });
  });

  describe('validateLicense', () => {
    test('should send POST request to validate license code', async () => {
      // Given, I have a license code to validate
      const url = 'rest/info/license/validate';
      const licenseCode = 'license-code-to-validate';
      const mockLicenseResponse: LicenseResponse = {
        installationId: 'validated-id',
        present: true,
        valid: true,
        expiryDate: 1735689600000,
        latestPublicationDate: 1735689600000,
        licensee: 'Validated Company',
        maxCpuCores: 4,
        typeOfUse: 'Production',
        version: '1.0',
        product: 'GRAPHDB_ENTERPRISE',
        productType: 'enterprise',
        usageRestriction: '',
        message: 'License is valid',
        licenseCapabilities: []
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockLicenseResponse));

      // When, I call validateLicense
      const result = await licenseRestService.validateLicense(licenseCode);

      // Then, I expect the validation result to be returned
      expect(result).toEqual(mockLicenseResponse);
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      expect(request?.method).toBe('POST');
      expect(request?.headers).toEqual(expect.objectContaining({
        'Content-Type': 'text/plain'
      }));
      expect(request?.body).toBe(licenseCode);
    });

    test('should send license code as plain text in request body', async () => {
      // Given, I have a license code
      const url = 'rest/info/license/validate';
      const licenseCode = 'my-test-license-code';
      const mockLicenseResponse: LicenseResponse = {
        installationId: 'invalid-id',
        present: false,
        valid: false,
        expiryDate: 0,
        latestPublicationDate: 0,
        licensee: '',
        maxCpuCores: 0,
        typeOfUse: '',
        version: '',
        product: '',
        productType: '',
        usageRestriction: '',
        message: 'Invalid license',
        licenseCapabilities: []
      };

      TestUtil.mockResponse(new ResponseMock(url).setResponse(mockLicenseResponse));

      // When, I call validateLicense
      await licenseRestService.validateLicense(licenseCode);

      // Then, the request body should contain the license code as is
      const request = TestUtil.getRequest(url);
      expect(request).toBeDefined();
      const body = request?.body;
      expect(body).toBe(licenseCode);
    });
  });
});

