import { ProductInfo } from '../../../models/product-info';
import { TestUtil } from '../../utils/test/test-util';
import { ResponseMock } from '../../http/test/response-mock';
import { ProductInfoService } from '../product-info.service';

describe('ProductInfoService', () => {
  let productInfoService: ProductInfoService;

  beforeEach(() => {
    productInfoService = new ProductInfoService();
  });

  test('should retrieve the local version information of the product', async () => {
    // Given, I have a mocked local version information
    // Note: the Workbench property in the response has an uppercase 'W'
    const mockProductInfo = {Workbench: '2.8.0', productVersion: '1.0.0' } as ProductInfo & { Workbench: string };
    TestUtil.mockResponse(new ResponseMock('/rest/info/version?local=1').setResponse(mockProductInfo));

    // When I call the getVersionLocal method
    const result = await productInfoService.getProductInfoLocal();

    const expectedProductInfo = {
      workbench: '2.8.0',
      productType: '',
      productVersion: '1.0.0',
      sesame: '',
      connectors: '',
    };

    // Then, I should get a ProductInfo object, with default property values
    expect(result).toEqual(expectedProductInfo);
  });
});
