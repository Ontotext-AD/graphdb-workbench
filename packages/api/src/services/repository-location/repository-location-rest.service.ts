import {RepositoryLocation} from '../../models/repository-location';
import {HttpService} from '../http/http.service';

export class RepositoryLocationRestService extends HttpService {
  getActiveRepositoryLocation(): Promise<RepositoryLocation> {
    return this.get('/rest/locations/active');
  }
}
