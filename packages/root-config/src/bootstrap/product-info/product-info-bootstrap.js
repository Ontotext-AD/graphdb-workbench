import {service, ProductInfoService, ProductInfoContextService} from '@ontotext/workbench-api';

const loadProductInfoLocal = () => {
  return service(ProductInfoService).getProductInfoLocal()
    .then((productInfo) => {
      service(ProductInfoContextService).updateProductInfo(productInfo);
    })
    .catch((error) => {
      throw new Error('Could not load local product info', error);
    });
};

export const productInfoBootstrap = [loadProductInfoLocal];
