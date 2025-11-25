import { ProductInfo } from '../../../models/product-info';
import { Mapper } from '../../../providers/mapper/mapper';
import {ProductInfoDto} from '../../../models/product-info/product-info-dto';

/**
 * Mapper class for ProductInfo objects.
 *
 * This class extends the generic Mapper class, specializing in mapping
 * partial ProductInfo data to complete ProductInfo models.
 */
export class ProductInfoMapper extends Mapper<ProductInfo> {
  /**
   * Maps partial ProductInfo data to a complete ProductInfo model.
   *
   * This method takes partial ProductInfo data and creates a new ProductInfo
   * instance, ensuring that all necessary properties are properly initialized.
   *
   * @param {ProductInfo | ProductInfoDto} data - Partial data of ProductInfo.
   * This can include any subset of
   *               ProductInfo properties.
   * @returns A new instance of ProductInfo populated with the provided data.
   */
  mapToModel(data: ProductInfo | ProductInfoDto): ProductInfo {
    if (data instanceof ProductInfo) {
      return data;
    }
    return new ProductInfo(data);
  }
}
