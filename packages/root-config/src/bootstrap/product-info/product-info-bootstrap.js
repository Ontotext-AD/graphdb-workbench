import {ServiceProvider, ProductInfoService, ProductInfoContextService} from '@ontotext/workbench-api';

const loadProductInfoLocal = () => {
  return ServiceProvider.get(ProductInfoService).getProductInfoLocal()
    .then((productInfo) => {
      ServiceProvider.get(ProductInfoContextService).updateProductInfo(productInfo);
    })
    .catch((error) => {
      throw new Error('Could not load local product info', error);
    });
};

export const productInfoBootstrap = [loadProductInfoLocal];
