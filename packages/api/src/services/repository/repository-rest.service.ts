import {HttpService} from '../http/http.service';
import {Repository} from '../../models/repositories';
import {RepositoryListResponse} from './response/repository-response';
import {RepositorySizeInfoResponse} from './response/repository-info-response';

export class RepositoryRestService extends HttpService {

  static readonly REPOSITORIES_ENDPOINT = 'rest/repositories';

  getRepositories(): Promise<RepositoryListResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`);
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfoResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${repository.id}/size?location=${encodeURIComponent(repository.location)}`);
  }
}
