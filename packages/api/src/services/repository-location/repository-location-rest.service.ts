import {HttpService} from '../http/http.service';
import {RepositoryLocationResponse} from './response/repository-location-response';

export class RepositoryLocationRestService extends HttpService {
  getActiveRepositoryLocation(): Promise<RepositoryLocationResponse> {
    return this.get<RepositoryLocationResponse>('rest/locations/active');
  }
}
