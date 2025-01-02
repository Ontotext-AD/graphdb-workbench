import { ProductInfo } from '../../../models/product-info';
import { ProductInfoContextService } from '../product-info-context.service';

describe('ProductInfoContextService', () => {
  let productInfoContextService: ProductInfoContextService;

  beforeEach(() => {
    productInfoContextService = new ProductInfoContextService();
  });

  test('updateProductInfo should update the productInfo in the context and notify subscribers', () => {
    // Given a new productInfo object
    const newProductInfo: ProductInfo = {workbench: '2.8.0', productVersion: '1.0.0'} as ProductInfo;
    const mockCallback = jest.fn();
    productInfoContextService.onProductInfoChanged(mockCallback);

    // When updating the productInfo
    productInfoContextService.updateProductInfo(newProductInfo);

    // Then the context should be updated and subscribers notified
    expect(mockCallback).toHaveBeenLastCalledWith(newProductInfo);
  });

  test('should stop receiving updates, after unsubscribe', () => {
    // Given a new productInfo object
    const newProductInfo: ProductInfo = {workbench: '2.8.0', productVersion: '1.0.0'} as ProductInfo;
    const mockCallback = jest.fn();
    const unsubscribe = productInfoContextService.onProductInfoChanged(mockCallback);
    // Clear the callback call when the callback function is registered.
    mockCallback.mockClear();

    // When unsubscribed
    unsubscribe();

    // Then the context should not receive updates
    productInfoContextService.updateProductInfo(newProductInfo);
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
