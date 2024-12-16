import {HttpService} from '../http/http.service';
import {Repository, RepositorySizeInfo} from '../../models/repositories';

export class RepositoryRestService extends HttpService {

  static readonly REPOSITORIES_ENDPOINT = '/rest/repositories';

  getRepositories(): Promise<Record<string, unknown[]>> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`);
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfo> {
    return fetch(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${repository.id}/size?location=${encodeURIComponent(repository.location)}`)
      .then((response) => response.json());
  }
}
