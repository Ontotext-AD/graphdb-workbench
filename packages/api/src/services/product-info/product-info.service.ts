import { Service } from '../../providers/service/service';
import { service } from '../../providers';
import { ProductInfo } from '../../models/product-info';
import { ProductInfoMapper } from './mappers/product-info.mapper';
import { ProductInfoRestService } from './product-info-rest.service';

/**
 * Service responsible for retrieving and managing product information.
 */
export class ProductInfoService implements Service {
  private readonly productInfoMapper: ProductInfoMapper = service(ProductInfoMapper);
  private readonly productInfoService: ProductInfoRestService = service(ProductInfoRestService);

  /**
   * Retrieves the local version information of the product.
   *
   * This function fetches the local version data from the license REST service
   * and maps the response to a ProductInfo model object.
   *
   * @returns {Promise<ProductInfo>} A Promise that resolves to a ProductInfo object
   * containing the local version information of the product.
   */
  async getProductInfoLocal(): Promise<ProductInfo> {
    const response = await this.productInfoService.getProductInfoLocal();
    return this.productInfoMapper.mapToModel(response);
  }
}
