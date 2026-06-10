import {ProductInfo} from '../../../../models/product-info';
import {TestUtil} from '../../../utils/test/test-util';
import {ResponseMock} from '../../../http/test/response-mock';
import {ProductInfoService} from '../product-info.service';
import {ProductInfoResponse} from '../response/product-info-response';
import {LocationMockProvider} from '../../location/test/location-mock-provider';
import {LocationList} from '../../../../models/location';

describe('ProductInfoService', () => {
  let productInfoService: ProductInfoService;

  beforeEach(() => {
    productInfoService = new ProductInfoService();
  });

  test('should retrieve the local version information of the product', async () => {
    // Given, I have a mocked local version information
    // Note: the Workbench property in the response has an uppercase 'W'
    const mockProductInfo: ProductInfoResponse = {
      Workbench: '2.8.0',
      productVersion: '1.0.0',
      Ontop: '5.3.0',
    } as ProductInfoResponse;
    TestUtil.mockResponse(new ResponseMock('rest/info/version?local=1').setResponse(mockProductInfo));

    // When I call the getVersionLocal method
    const result = await productInfoService.getProductInfoLocal();

    const expectedProductInfo = {
      workbench: '2.8.0',
      productType: '',
      productVersion: '1.0.0',
      shortVersion: '1.0',
      sesame: '',
      connectors: '',
      ontop: '5.3.0',
    };

    // Then, I should get a ProductInfo object, with default property values
    expect(result).toEqual(expectedProductInfo);
  });

  it('should calculate the shortVersion with the first attribute only', async () => {
    const data = {
      Workbench: '1.0.0',
      productType: 'GraphDB',
      productVersion: '9.10.1-M3-RC1'
    } as ProductInfoResponse;
    TestUtil.mockResponse(new ResponseMock('rest/info/version?local=1').setResponse(data));

    // When I call the getVersionLocal method
    const result = await productInfoService.getProductInfoLocal();

    expect(result.shortVersion).toEqual('9.10-M3');
  });

  it('should handle missing optional fields', async () => {
    const data = {
      Workbench: '1.0.0',
      productType: 'GraphDB',
      productVersion: '9.10.1'
    } as ProductInfoResponse;
    TestUtil.mockResponse(new ResponseMock('rest/info/version?local=1').setResponse(data));
    const result = await productInfoService.getProductInfoLocal();

    expect(result).toBeInstanceOf(ProductInfo);
    expect(result.workbench).toEqual('1.0.0');
    expect(result.productType).toEqual('GraphDB');
    expect(result.productVersion).toEqual('9.10.1');
    expect(result.shortVersion).toEqual('9.10');
    expect(result.sesame).toEqual('');
    expect(result.connectors).toEqual('');
  });

  it('should map a complete product info object correctly', async () => {
    const data = {
      Workbench: '1.0.0',
      productType: 'GraphDB',
      productVersion: '9.10.1',
      sesame: '3.6.0',
      connectors: '5.0.0',
      Ontop: '5.3.0',
    } as ProductInfoResponse;

    TestUtil.mockResponse(new ResponseMock('rest/info/version?local=1').setResponse(data));
    const result = await productInfoService.getProductInfoLocal();

    expect(result).toBeInstanceOf(ProductInfo);
    expect(result.workbench).toBe('1.0.0');
    expect(result.productType).toBe('GraphDB');
    expect(result.productVersion).toBe('9.10.1');
    expect(result.shortVersion).toBe('9.10');
    expect(result.sesame).toBe('3.6.0');
    expect(result.connectors).toBe('5.0.0');
  });

  describe('getProductInfo', async () => {
    test('should return a version info for specified location', async () => {
      // GIVEN: The version info endpoint returns a version information for specified location.
      const productInfoResponse = {} as ProductInfoResponse;
      TestUtil.mockResponse(new ResponseMock('rest/info/version').setResponse(productInfoResponse));
      const locationURI = 'product-info-location-uri';

      const expectedResults = new ProductInfo({
        "productType": "enterprise",
        "productVersion": "11.4-SNAPSHOT",
        "connectors": "16.7.0-TR3",
        "sesame": "5.2.2-jakarta",
        "workbench": "3.3.0-RC3",
        ontop: '5.3.0',
      });

      // WHEN: I call the getLocations method.
      const locationList = await productInfoService.getProductInfo(locationURI);
      // THEN: I expect a GET request to be sent to the locations endpoint.
      const request = TestUtil.getRequest('rest/locations');
      expect(request).toBeDefined();
      expect(request?.method).toBe('GET');
      // AND: I receive the list of available locations.
      expect(locationList).toBeInstanceOf(LocationList);
      expect(locationList).toEqual(expectedResults);
    });
  });
});
