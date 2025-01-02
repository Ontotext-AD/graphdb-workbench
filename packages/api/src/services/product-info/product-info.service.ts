import { Service } from '../../providers/service/service';
import { ServiceProvider } from '../../providers';
import { ProductInfo } from '../../models/product-info';
import { ProductInfoMapper } from './mappers/product-info.mapper';
import { ProductInfoRestService } from './product-info-rest.service';

/**
 * Service responsible for retrieving and managing product information.
 */
export class ProductInfoService implements Service {
  private readonly productInfoMapper: ProductInfoMapper = ServiceProvider.get(ProductInfoMapper);
  private readonly productInfoService: ProductInfoRestService = ServiceProvider.get(ProductInfoRestService);

  /**
   * Retrieves the local version information of the product.
   *
   * This function fetches the local version data from the license REST service
   * and maps the response to a ProductInfo model object.
   *
   * @returns {Promise<ProductInfo>} A Promise that resolves to a ProductInfo object
   * containing the local version information of the product.
   */
  getProductInfoLocal(): Promise<ProductInfo> {
    return this.productInfoService.getProductInfoLocal()
      .then(response => this.productInfoMapper.mapToModel(response));
  }
}
