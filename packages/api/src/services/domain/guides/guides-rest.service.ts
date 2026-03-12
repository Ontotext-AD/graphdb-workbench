import {HttpService} from '../../http/http.service';
import {InteractiveGuideResponse} from '../../../models/interactive-guide/interactive-guide-response';

/**
 * Service class for handling REST API calls related to guides.
 * Extends the HttpService to use its HTTP request capabilities.
 */
export class GuidesRestService extends HttpService {
  private readonly GUIDES_ENDPOINT = 'rest/guides';

  /**
   * Fetches the list of all available guides.
   *
   * @returns A Promise that resolves to an array of {@link InteractiveGuideResponse} objects.
   */
  getGuides(): Promise<InteractiveGuideResponse[]> {
    return this.get(this.GUIDES_ENDPOINT);
  }
}
