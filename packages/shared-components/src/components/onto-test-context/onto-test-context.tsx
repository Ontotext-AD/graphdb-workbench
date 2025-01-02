import { Component, Method } from '@stencil/core';
import {
  License,
  LicenseContextService,
  ProductInfo,
  ProductInfoContextService,
  ServiceProvider
} from '@ontotext/workbench-api';

/**
 * A component for managing test context in the application. Used only for testing
 */
@Component({
  tag: 'onto-test-context',
})
export class OntoTestContext {

  /**
   * Updates the license information in the context.
   *
   * This method uses the LicenseContextService to update the license
   * and returns a resolved Promise once the operation is complete.
   *
   * @param license - The new License object to be set.
   * @returns A Promise that resolves when the license update is complete.
   */
  @Method()
  updateLicense(license: License): Promise<void> {
    ServiceProvider.get(LicenseContextService).updateLicense(license);
    return Promise.resolve();
  }

    /**
   * Updates the product information in the context.
   *
   * This method uses the ProductInfoContextService to update the product information
   * and returns a resolved Promise once the operation is complete.
   *
   * @param productInfo - The new ProductInfo object to be set.
   * @returns A Promise that resolves when the product information update is complete.
   */
  @Method()
  updateProductInfo(productInfo: ProductInfo): Promise<void> {
    ServiceProvider.get(ProductInfoContextService).updateProductInfo(productInfo);
    return Promise.resolve();
  }
}
