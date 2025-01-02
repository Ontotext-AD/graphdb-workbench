import { ContextService } from '../context/context.service';
import { ProductInfo } from '../../models/product-info';
import { ValueChangeCallback } from '../../models/context/value-change-callback';

/**
 * Service for managing product information context.
 */
export class ProductInfoContextService extends ContextService {
  private static readonly PRODUCT_INFO = 'productInfo';

  /**
   * Updates the product information in the context.
   *
   * @param productInfo - The new ProductInfo object to be set in the context.
   */
  updateProductInfo(productInfo: ProductInfo): void {
    this.updateContextProperty(ProductInfoContextService.PRODUCT_INFO, productInfo);
  }

  /**
   * Subscribes to changes in the product information context.
   *
   * @param callbackFn - A callback function that will be called when the product information changes.
   * The callback receives the updated ProductInfo object or undefined as its parameter.
   * @returns A function that, when called, will unsubscribe from the product information changes.
   */
  onProductInfoChanged(callbackFn: ValueChangeCallback<ProductInfo | undefined>): () => void {
    return this.subscribe(ProductInfoContextService.PRODUCT_INFO, callbackFn);
  }
}
