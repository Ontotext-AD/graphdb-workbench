import {HttpService} from '../../http/http.service';
import {ProductInfoResponse} from './response/product-info-response';

/**
 * Service for product information REST calls.
 */
export class ProductInfoRestService extends HttpService {
  private readonly VERSION_URL = 'rest/info/version';

  /**
   * Retrieves the local version information of the product.
   *
   * This method sends a GET request to the 'rest/info/version' endpoint with a <code>local=1</code> query parameter
   * to fetch the local version details of the product. The value of the <code>local</code> query parameter
   * does not matter. The presence of it will result in the server returning the local version details.
   *
   * @returns A Promise that resolves to a ProductInfo object containing the local version information.
   */
  getProductInfoLocal(): Promise<ProductInfoResponse> {
    return this.get<ProductInfoResponse>(`${this.VERSION_URL}?local=1`);
  }

  /**
   * Retrieves the version information of the product for a specific location.
   *
   * @param locationUri - The URI of the location for which to fetch the product information.
   * @returns A Promise that resolves to a ProductInfo object containing the version information of location with URI <code>locationUri</code>.
   */
  getProductInfo(locationUri: string): Promise<ProductInfoResponse> {
    return this.get<ProductInfoResponse>(this.VERSION_URL, {
      headers: {
        'X-GraphDB-Repository-Location': locationUri
      }
    });
  }
}
