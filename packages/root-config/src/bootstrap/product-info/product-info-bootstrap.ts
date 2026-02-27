import {service, ProductInfoService, ProductInfoContextService} from '@ontotext/workbench-api';

const loadProductInfoLocal = (): Promise<void> => {
  return service(ProductInfoService).getProductInfoLocal()
    .then((productInfo) => {
      service(ProductInfoContextService).updateProductInfo(productInfo);
    })
    .catch((error) => {
      throw new Error(`Could not load local product info: ${error.message || error}`);
    });
};

export const productInfoBootstrap = [loadProductInfoLocal];
