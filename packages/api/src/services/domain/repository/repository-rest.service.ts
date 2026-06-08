import {HttpService} from '../../http/http.service';
import {Repository, RepositoryReference} from '../../../models/repositories';
import {RepositoryListResponse} from './response/repository-response';
import {RepositorySizeInfoResponse} from './response/repository-info-response';

export class RepositoryRestService extends HttpService {

  static readonly REPOSITORIES_ENDPOINT = 'rest/repositories';

  getRepositories(): Promise<RepositoryListResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/all`);
  }

  getRepositorySizeInfo(repository: Repository): Promise<RepositorySizeInfoResponse> {
    return this.get(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${this.encodeURIComponentStrict(repository.id)}/size?location=${encodeURIComponent(repository.location)}`);
  }

  /**
   * Deletes a repository from the specified location.
   *
   * @param repository The repository reference containing the repository identifier and location.
   * @returns A promise that resolves when the repository has been successfully deleted
   */
  deleteRepository(repository: RepositoryReference): Promise<void> {
    return this.delete(`${RepositoryRestService.REPOSITORIES_ENDPOINT}/${this.encodeURIComponentStrict(repository.id)}`, {
      params: {
        location: repository.location
      }
    });
  }
}
