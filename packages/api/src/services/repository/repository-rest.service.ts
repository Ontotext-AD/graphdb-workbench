import {HttpService} from '../http/http.service';

export class RepositoryRestService extends HttpService {
  getRepositories(): Promise<Record<string, unknown[]>> {
    return this.get('/rest/repositories/all');
  }
}
