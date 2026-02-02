import { ContextService } from '../context';
import { ProductInfo } from '../../models/product-info';
import { ValueChangeCallback } from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {LifecycleHooks} from '../../providers/service/lifecycle-hooks';

type ProductInfoContextFields = {
  readonly PRODUCT_INFO: string;
};

type ProductInfoContextFieldParams = {
  readonly PRODUCT_INFO: ProductInfo;
};

/**
 * Service for managing product information context.
 */
export class ProductInfoContextService extends ContextService<ProductInfoContextFields> implements DeriveContextServiceContract<ProductInfoContextFields, ProductInfoContextFieldParams>, LifecycleHooks {
  readonly PRODUCT_INFO = 'productInfo';

  /**
   * Updates the product information in the context.
   *
   * @param productInfo - The new ProductInfo object to be set in the context.
   */
  updateProductInfo(productInfo: ProductInfo): void {
    this.updateContextProperty(this.PRODUCT_INFO, productInfo);
  }

  /**
   * Subscribes to changes in the product information context.
   *
   * @param callbackFn - A callback function that will be called when the product information changes.
   * The callback receives the updated ProductInfo object or undefined as its parameter.
   * @returns A function that, when called, will unsubscribe from the product information changes.
   */
  onProductInfoChanged(callbackFn: ValueChangeCallback<ProductInfo | undefined>): () => void {
    return this.subscribe(this.PRODUCT_INFO, callbackFn);
  }

  /**
   * Retrieves the product information from the context.
   *
   * @return the product information or undefined, if there is no product information.
   */
  getProductInfo(): ProductInfo | undefined {
    return this.getContextPropertyValue(this.PRODUCT_INFO);
  }
}
