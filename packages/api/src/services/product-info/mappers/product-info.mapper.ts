import {ProductInfo} from '../../../models/product-info';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for ProductInfo objects.
 *
 * This class extends the generic Mapper class, specializing in mapping
 * partial ProductInfo data to complete ProductInfo models.
 */
export const mapProductInfoResponseToModel: MapperFn<Partial<ProductInfo>, ProductInfo> = (data) => {
  return new ProductInfo(data);
};
