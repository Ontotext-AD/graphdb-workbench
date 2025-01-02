import { ProductInfo } from '../../models/product-info';
import { HttpService } from '../http/http.service';

/**
 * Service for product information REST calls.
 */
export class ProductInfoRestService extends HttpService {
  private readonly VERSION_URL = '/rest/info/version';

  /**
   * Retrieves the local version information of the product.
   *
   * This method sends a GET request to the 'rest/info/version' endpoint with a <code>local=1</code> query parameter
   * to fetch the local version details of the product. The value of the <code>local</code> query parameter
   * does not matter. The presence of it will result in the server returning the local version details.
   *
   * @returns A Promise that resolves to a ProductInfo object containing the local version information.
   */
  getProductInfoLocal(): Promise<ProductInfo> {
    return this.get<ProductInfo>(`${this.VERSION_URL}?local=1`);
  }
}
