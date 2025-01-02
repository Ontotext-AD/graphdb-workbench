import { License } from '../../models/license';
import { HttpService } from '../http/http.service';

/**
 * Service class for handling REST API calls related to license operations.
 * Extends the HttpService to utilize its HTTP request capabilities.
 */
export class LicenseRestService extends HttpService {
  /**
   * Retrieves the current license information from the GraphDB settings.
   *
   * This method sends a GET request to the '/rest/graphdb-settings/license' endpoint
   * to fetch the license details.
   *
   * @returns A Promise that resolves to a License object containing the current license information.
   */
  getLicense(): Promise<License> {
    return this.get<License>('/rest/graphdb-settings/license');
  }
}
