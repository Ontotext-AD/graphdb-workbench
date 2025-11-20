import {HttpService} from '../http/http.service';
import {Repository, RepositorySizeInfo} from '../../models/repositories';
import {RepositoryListResponse} from '../../models/repositories/repository-response';

export class RepositoryRestService extends HttpService {

  static readonly REPOSITORIES_ENDPOINT = 'rest/repositories';

  getRepositories(): Promise<RepositoryListResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`);
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfo> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${repository.id}/size?location=${encodeURIComponent(repository.location)}`);
  }
}
