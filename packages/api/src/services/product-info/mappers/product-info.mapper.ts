import {ProductInfo} from '../../../models/product-info';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {ProductInfoResponse} from '../response/product-info-response';

/**
 * Mapper class for ProductInfo objects.
 *
 * This class extends the generic Mapper class, specializing in mapping
 * partial ProductInfo data to complete ProductInfo models.
 */
export const mapProductInfoResponseToModel: MapperFn<ProductInfoResponse, ProductInfo> = (data) => {
  return new ProductInfo({
    workbench: data.Workbench || '',
    productType: data.productType || '',
    productVersion: data.productVersion || '',
    sesame: data.sesame || '',
    connectors: data.connectors || '',
  });
};
